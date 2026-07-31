// Rank map used to compare a viewer's subscription plan against a blog's
// required accessLevel. Higher rank = more access. "pro" can read "free" and
// "pro" content but not "premium"; "premium" can read everything.
const PLAN_RANK = { free: 0, pro: 1, premium: 2 };

/**
 * Returns the numeric rank of a user's current plan. Anonymous visitors
 * (user === null/undefined) and any user without an active-equivalent plan
 * are treated as "free" (rank 0) -- this lets the same helper be reused for
 * both logged-in and anonymous requests on public blog routes.
 */
export const getUserPlanRank = (user) => {
  const plan = user?.subscription?.plan || "free";
  return PLAN_RANK[plan] ?? 0;
};

/**
 * Core access-control predicate: can a viewer on `userPlan` (a plan string,
 * e.g. "free"/"pro"/"premium") read content that requires `blogAccessLevel`?
 * Accessible when the viewer's rank is >= the content's required rank.
 */
export const isBlogAccessible = (userPlan, blogAccessLevel) => {
  const userRank = PLAN_RANK[userPlan] ?? 0;
  const requiredRank = PLAN_RANK[blogAccessLevel] ?? 0;
  return userRank >= requiredRank;
};

/**
 * Express middleware factory for routes that should be gated behind a
 * minimum plan (e.g. certain premium-only API features). Not used by the
 * blog list/detail routes -- those need custom per-item logic (each blog has
 * its own accessLevel) and remain open to anonymous users, so they call
 * getUserPlanRank/isBlogAccessible directly inside blogController instead.
 */
export const requirePlan = (minAccessLevel) => (req, res, next) => {
  const userRank = getUserPlanRank(req.user);
  const requiredRank = PLAN_RANK[minAccessLevel] ?? 0;

  if (userRank < requiredRank) {
    return res.status(403).json({ message: "Your current plan does not include this feature" });
  }
  next();
};

export const PLAN_RANK_MAP = PLAN_RANK;
