# hour-rewards-ui

React Native components for punch-card loyalty rewards: a stampable card, the animations
that make earning a punch feel like something, and the pieces around it.

Built for ETHGlobal Lisbon 2026, and used by the [Hour](https://hourapp.co) app to show a
venue's rewards program.

## Install

```bash
yarn add hour-rewards-ui
```

Peer dependencies (all already present in a typical Expo app):
`react-native-reanimated`, `react-native-svg`, `lucide-react-native`, `expo-camera` (the
capture and scan flows), and `react-native-qrcode-svg` (drawing a redemption code).

The package ships TypeScript source rather than a build, so it goes through your app's
Babel/Metro pipeline like the rest of your code. Consuming it from a git submodule works
the same way — point an alias at `src`:

```js
// babel.config.js
['module-resolver', { alias: { 'hour-rewards-ui': './vendor/hour-rewards-ui/src' } }]
```

## Components

### `RewardPunchCard`

The full card: venue identity, reward copy, a punch grid that animates each new stamp, and
a progress bar. Slot size is derived from the measured grid width, so it fills whatever
you give it, five slots to a row.

```tsx
<RewardPunchCard
  venueName="Bar Alimentar"
  venueAddress="R. da Palma 43"
  punchesEarned={3}
  punchesRequired={5}
  rewardDescription="Collect 5 punches and your next round is on us."
  justPunchedIndex={2}
  celebrating={false}
  reduceMotion={false}
/>
```

`justPunchedIndex` is the one slot that plays the stamp-and-burst animation — pass the
index that was just earned, and `null` on a cold render so existing punches appear
already stamped. `celebrating` replays the whole-card pop, e.g. after a redemption resets
progress. `reduceMotion` drops the per-slot burst on low-tier devices.

### `RewardReadyBanner`

Callout for a completed card, with the same pop animation.

```tsx
<RewardReadyBanner title="Reward unlocked!" subtitle="Show this to staff to redeem." />
```

### `RewardPreviewRow`

One-line progress summary for embedding in a venue page or a list. Renders the row only,
so wrap it in your own surface and press handler.

```tsx
<TouchableOpacity onPress={openRewards}>
  <YourCard>
    <RewardPreviewRow punchesEarned={3} punchesRequired={5} />
  </YourCard>
</TouchableOpacity>
```

### `RewardHistoryList`

Newest-first timeline of punches earned and rewards claimed. Renders rows only, for the
same reason.

```tsx
<RewardHistoryList events={history} emptyLabel="No activity yet" />
```

### `PunchCameraModal`

The whole earn-a-punch flow, full screen: viewfinder and shutter, a progress bar that walks
through uploading, reading and verifying while the request is out, then either handing control
back to your screen or explaining the refusal with a retry.

```tsx
<PunchCameraModal
  visible={isCameraOpen}
  onRequestClose={() => setIsCameraOpen(false)}
  onApproved={addPunch}
  verifyPunch={verifyPunchPhoto}
/>
```

`verifyPunch` is the seam: it takes the captured photo's URI and resolves with a
`PunchVerificationResult`. Anything it throws is shown as a connection problem, so let network
errors through rather than swallowing them.

### `RewardQrCodeModal`

The customer's side of a redemption, full screen: asks for a code, draws it, counts down what is
left of it, and offers a fresh one when it runs out.

```tsx
<RewardQrCodeModal
  visible={isQrCodeOpen}
  onRequestClose={() => setIsQrCodeOpen(false)}
  rewardDescription={summary.rewardDescription}
  requestCode={() => rewardsApi.createRedemptionCode(venueId)}
/>
```

`requestCode` is the seam, called on open and again on expiry. The QR is drawn on the device — a
live token has no business travelling to a third-party generator, and a code that needs a network
to be *shown* is a code that fails at the till.

Nothing here knows the code was scanned: that happens on the venue's phone. Poll your summary
while the modal is open and close it when the card is no longer full.

### `QrRedemptionScanModal`

The venue's side, full screen: scan a customer's code, submit it, then show whether it was
honoured and what to hand over.

```tsx
<QrRedemptionScanModal
  visible={isScannerOpen}
  onRequestClose={() => setIsScannerOpen(false)}
  expectedVenueId={venueId}
  verifyRedemptionQr={verifyRedemptionQr}
  onRedeemed={refreshVenue}
/>
```

`expectedVenueId` is the venue whose staff are holding the phone. A code for anywhere else — and
anything that was never one of our codes — is refused here without a round trip, because both are
legible from the payload itself. Everything else is the server's call.

## Submitting a receipt

Your app owns its API client — base URL, auth, refresh, timeouts — so the request itself stays
yours. Either side of it is here: the multipart body the endpoint expects, and the verdict
mapped into what the modal shows, refusal codes turned into words a customer can act on.

```ts
import { punchResultFromVerdict, receiptPhotoFormData, type ReceiptVerdict } from 'hour-rewards-ui';

const verifyPunchPhoto = async (photoUri: string) =>
  punchResultFromVerdict(
    await api.postForm<ReceiptVerdict>(
      `/api/rewards/venues/${venueId}/receipts`,
      receiptPhotoFormData(photoUri),
      60_000, // OCR plus inference: well past a normal request timeout
    ),
  );
```

`ReceiptVerdict` mirrors what the companion
[`hour-rewards-sdk`](https://github.com/myounatan/hour-backend-ethglobal-lisbon-2026) answers
with, including the attestation of the 0G run that judged the receipt (`zg_request_id`,
`zg_tee_verified`) and where the punch landed on the venue's Hedera topic.

## Redeeming a code

Same split: the requests are yours, the formats and the wording are here.

```ts
import {
  redemptionCodeFromResponse,
  redemptionResultFromVerdict,
  redemptionScanBody,
  type RedemptionCodeResponse,
  type RedemptionScanVerdict,
} from 'hour-rewards-ui';

// Customer: ask for a code to show.
const createRedemptionCode = async (venueId: string) =>
  redemptionCodeFromResponse(
    await api.post<RedemptionCodeResponse>(
      `/api/rewards/venues/${venueId}/redemption-codes`,
    ),
  );

// Venue: submit what the camera read, exactly as read.
const verifyRedemptionQr = async (qrData: string) =>
  redemptionResultFromVerdict(
    await api.post<RedemptionScanVerdict>(
      `/api/rewards/venues/${venueId}/redemption-scans`,
      redemptionScanBody(qrData),
    ),
  );
```

The deadline a code counts down to is derived from the duration the server sends rather than its
`expires_at` timestamp, since that timestamp is naive UTC — a duration is unambiguous, and a
countdown runs against the device's clock either way.

`parseRedemptionPayload` reads the payload format written by `hour_rewards.redemption` in the SDK,
and is what lets a scanner turn away another venue's code on the spot. Reading it is a
convenience, never an authority: the server checks the same claims again before honouring
anything.

## Types

`PunchCardSummary` and `RewardHistoryEvent` describe the shapes the components consume,
mirroring what a rewards API is expected to return. `isReadyToRedeem(summary)` is the one
piece of logic worth sharing between screens.

```ts
import { isReadyToRedeem, type PunchCardSummary } from 'hour-rewards-ui';
```

## Theming

Colours and spacing live in `REWARD_COLORS` and `REWARD_SPACING`, exported so a host app
can match its surrounding UI to the card. `onCard(alpha)` and `accentAlpha(alpha)` are the
helpers used for anything drawn on the dark card surface.

## Licence

MIT
