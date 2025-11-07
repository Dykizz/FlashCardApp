import FlashCards from "../FlashCards";

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Thư viện Flashcard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Chọn một bộ thẻ để bắt đầu học tập!
          </p>
        </header>
        <FlashCards />
      </main>
    </div>
  );
}
