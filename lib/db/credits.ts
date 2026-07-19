import { createServiceRoleClient } from "./client";

const FREE_DAILY_CREDITS = 3;

function isNewLocalDay(updatedAt: string): boolean {
  const last = new Date(updatedAt);
  const now = new Date();
  return (
    last.getUTCFullYear() !== now.getUTCFullYear() ||
    last.getUTCMonth() !== now.getUTCMonth() ||
    last.getUTCDate() !== now.getUTCDate()
  );
}

/**
 * Reset the user's free daily allowance if a new day has started. Purchased
 * credits and the free daily allowance share one `balance` column (see
 * schema in the masterplan) — we top back up to at least 3 rather than
 * resetting to exactly 3, so a paid surplus isn't wiped out.
 * TODO(founder): split `balance` into `free_balance`/`paid_balance` columns
 * if you need to report free vs. paid usage separately.
 */
async function resetIfNewDay(userId: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("credits").select("balance, updated_at").eq("user_id", userId).maybeSingle();

  if (!data) {
    await supabase.from("credits").insert({ user_id: userId, balance: FREE_DAILY_CREDITS });
    return FREE_DAILY_CREDITS;
  }

  if (isNewLocalDay(data.updated_at) && data.balance < FREE_DAILY_CREDITS) {
    const newBalance = FREE_DAILY_CREDITS;
    await supabase
      .from("credits")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return newBalance;
  }

  return data.balance;
}

export async function getBalance(userId: string): Promise<number> {
  return resetIfNewDay(userId);
}

export async function deductCredit(userId: string): Promise<{ ok: boolean; remaining: number }> {
  const supabase = createServiceRoleClient();
  const balance = await resetIfNewDay(userId);

  if (balance <= 0) {
    return { ok: false, remaining: 0 };
  }

  const remaining = balance - 1;
  await supabase
    .from("credits")
    .update({ balance: remaining, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { ok: true, remaining };
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const supabase = createServiceRoleClient();
  const balance = await resetIfNewDay(userId);
  const newBalance = balance + amount;

  await supabase
    .from("credits")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return newBalance;
}
