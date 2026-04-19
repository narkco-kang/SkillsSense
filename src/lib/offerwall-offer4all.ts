/**
 * Offer4All Offerwall Integration
 *
 * Offer4All is an offerwall network that lets users complete offers to unlock rewards.
 * Publishers integrate via their JavaScript SDK.
 *
 * Setup:
 * 1. Sign up at https://offer4all.com/publishers
 * 2. Create an offerwall campaign
 * 3. Get your Publisher ID and Campaign ID
 * 4. Set env vars: NEXT_PUBLIC_OFFER4ALL_PUB_ID, NEXT_PUBLIC_OFFER4ALL_CAMPAIGN_ID
 *
 * How it works:
 * - User clicks "Watch Ad" → opens Offer4All offerwall in a popup/modal
 * - User completes an offer → Offer4All sends a server-side postback to our webhook
 * - Our webhook verifies and marks the user as unlocked for their next download
 *
 * Postback URL (configure in Offer4All dashboard):
 *   https://yourdomain.com/api/offerwall/callback?user={user_id}&offer={offer_id}&amount={reward}
 */

export type OfferwallConfig = {
  pubId: string;
  campaignId: string;
  userId: string; // Unique identifier for the user (email or generated user ID)
};

export type OfferwallResult = {
  success: boolean;
  offerId?: string;
  reward?: number;
  error?: string;
};

/**
 * Open the Offer4All offerwall
 * Called client-side when user clicks "Watch Ad"
 */
export function openOfferwall(config: OfferwallConfig): void {
  const { pubId, campaignId, userId } = config;

  // Build the offerwall URL with Offer4All parameters
  const offerwallUrl = new URL("https://offer4all.com/offerwall");
  offerwallUrl.searchParams.set("pid", pubId);
  offerwallUrl.searchParams.set("cid", campaignId);
  offerwallUrl.searchParams.set("uid", userId);
  // Set callback so Offer4All can notify us when offer is completed
  offerwallUrl.searchParams.set(
    "callback_url",
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/offerwall/callback`
  );

  // Open in a centered popup window
  const width = 800;
  const height = 600;
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

  window.open(
    offerwallUrl.toString(),
    "offerwall",
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}

/**
 * Build the offerwall URL for embedding or redirect
 * Use this for a modal-based approach
 */
export function getOfferwallUrl(config: OfferwallConfig): string {
  const { pubId, campaignId, userId } = config;

  const url = new URL("https://offer4all.com/offerwall");
  url.searchParams.set("pid", pubId);
  url.searchParams.set("cid", campaignId);
  url.searchParams.set("uid", userId);
  url.searchParams.set(
    "callback_url",
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/offerwall/callback`
  );
  // Auto-close the offerwall after successful completion
  url.searchParams.set("autoclose", "1");

  return url.toString();
}

/**
 * Verify an offer completion callback from Offer4All
 * This is called server-side when Offer4All sends a postback
 *
 * IMPORTANT: In production, you MUST validate the signature from Offer4All
 * to prevent fake completions. Check Offer4All's documentation for the
 * correct validation method (usually HMAC verification).
 */
export function verifyOfferwallCallback(
  params: Record<string, string>,
  secret: string
): OfferwallResult {
  const { user_id, offer_id, amount, status } = params;

  // Basic validation
  if (!user_id || !offer_id) {
    return { success: false, error: "Missing required parameters" };
  }

  // In production, verify the HMAC signature here
  // Example (check Offer4All docs for actual verification method):
  // const expectedSig = crypto.createHmac("sha256", secret)
  //   .update(`${user_id}:${offer_id}:${amount}`)
  //   .digest("hex");
  // if (params.signature !== expectedSig) return { success: false, error: "Invalid signature" };

  if (status === "complete" || status === "1") {
    return { success: true, offerId: offer_id, reward: amount ? parseFloat(amount) : 0 };
  }

  return { success: false, error: `Offer status: ${status}` };
}

/**
 * Generate a unique user ID for anonymous users
 * Used when user hasn't provided their email yet
 */
export function generateAnonymousUserId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
