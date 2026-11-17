import type { StackConfig } from '@/components/iso/stack/types'

// AgriTA Mobile: the Flutter field-worker client of the AgriTA platform. Tech from the app's pubspec and README
// (Riverpod with riverpod_generator, go_router, dio with an auth/refresh/idempotency interceptor, reactive_forms,
// freezed, shadcn_ui, workmanager outbox sync). The API is a separate backend.
// Snippets are representative Dart with generic identifiers, not the client's code, routes or endpoints.
export const agritaMobileConfig: StackConfig = {
  id: 'agrita-mobile',
  fig: 5,
  title: 'AgriTA Mobile stack',
  hint: 'scroll to log a harvest and sync it',
  skin: 'phone',
  layers: [
    { id: 'ui', label: 'ui', tech: ['Flutter', 'shadcn_ui'] },
    { id: 'routes', label: 'routes', tech: ['go_router'] },
    { id: 'state', label: 'state', tech: ['Riverpod', 'riverpod_generator'] },
    { id: 'forms', label: 'forms', tech: ['reactive_forms', 'freezed'] },
    { id: 'client', label: 'client', tech: ['dio', 'auth interceptor'] },
    { id: 'sync', label: 'sync', tech: ['secure storage', 'workmanager', 'outbox'] },
  ],
  side: [
    { id: 'charts', label: 'charts', tech: ['fl_chart'] },
    { id: 'capture', label: 'capture', tech: ['image_picker', 'speech_to_text'] },
    { id: 'crash', label: 'crash', tech: ['Sentry'] },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat harvest_lot_card.dart',
      lines: ['ShadCard(title: Text(lot.code),', '  child: LotStatusChip(lot.status))'],
      result: 'built',
    },
    {
      layer: 1,
      prompt: 'cat router.dart',
      lines: ['GoRoute(path: \'/lots/:id\',', '  redirect: (ctx, s) => authGate(ctx, s))'],
      result: 'guarded',
    },
    {
      layer: 2,
      prompt: 'cat lot_provider.dart',
      lines: ['Future<Lot> lot(Ref ref, String id) =>', '  ref.watch(lotRepoProvider).get(id);'],
      result: 'ready',
    },
    {
      layer: 3,
      prompt: 'cat harvest_form.dart',
      lines: ['FormGroup({\'qty\': FormControl<double>(', '  validators: [Validators.required])})'],
      result: 'typed',
    },
    {
      layer: 4,
      prompt: 'cat auth_gate.dart',
      lines: ['class AuthGate extends QueuedInterceptor {', '  onError(e, h) => retryAfterRefresh(e, h);'],
      result: '200',
    },
    {
      layer: 5,
      prompt: 'cat outbox_flush.dart',
      lines: ['Workmanager().registerOneOffTask(', '  \'flush\', \'outbox\');'],
      result: 'queued',
    },
  ],
}
