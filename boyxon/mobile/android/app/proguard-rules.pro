# R8/proguard qoidalari.
#
# shared_preferences_android 2.5.0 JNIgen texnologiyasidan foydalanadi: Dart tomoni
# JNI orqali Kotlin klasslarini ASL NOM bo'yicha qidiradi:
#   kotlin.coroutines.Continuation  (suspend funksiyalar imzosida)
#   kotlin.coroutines.intrinsics.CoroutineSingletons
#   kotlin.jvm.internal.DefaultConstructorMarker
#   kotlin.Result va boshqalar
# R8 reliz build'da bu klasslarni "ishlatilmagan" deb o'chirib tashlaydi yoki
# nomini o'zgartiradi (u JNI reflection'ni ko'ra olmaydi) va ilova ochilishda
# yiqiladi: NoSuchMethodError / ClassNotFoundException.
# Shu sababli butun kotlin stdlib nomlarini saqlab qolamiz.
-keep class kotlin.** { *; }
-keep class io.flutter.plugins.sharedpreferences.** { *; }
