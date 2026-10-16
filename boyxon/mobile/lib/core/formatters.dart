/// Formatlash yordamchilari (web'dagi formatPrice/formatDate bilan bir xil uslub).
library;

/// 45000 → "45 000 UZS"
String formatPrice(num value) {
  final digits = value.round().abs().toString();
  final grouped = digits.replaceAllMapped(
    RegExp(r'\B(?=(\d{3})+(?!\d))'),
    (m) => ' ',
  );
  return '${value < 0 ? '-' : ''}$grouped UZS';
}

/// "16.10.2026, 14:30"
String formatDateTime(DateTime dt) {
  final d = dt.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(d.day)}.${two(d.month)}.${d.year}, ${two(d.hour)}:${two(d.minute)}';
}
