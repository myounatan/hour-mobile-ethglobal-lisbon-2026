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
`react-native-reanimated`, `react-native-svg`, `lucide-react-native`.

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
