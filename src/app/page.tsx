import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 mb-6 bg-primary/10 rounded-full">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Học thông minh hơn với
            <span className="block text-primary mt-2">Flash Card App</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nền tảng học tập hiện đại giúp bạn ghi nhớ kiến thức hiệu quả với
            phương pháp lặp lại ngắt quãng thông minh
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/flashcards" className="flex items-center">
                Bắt đầu học ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tính năng nổi bật
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Học thông minh</h3>
                <p className="text-muted-foreground">
                  Thuật toán ưu tiên câu sai để bạn tập trung vào những gì cần
                  cải thiện
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Theo dõi tiến độ</h3>
                <p className="text-muted-foreground">
                  Xem thống kê chi tiết về quá trình học tập và những thẻ đã nắm
                  vững
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Tùy chỉnh linh hoạt
                </h3>
                <p className="text-muted-foreground">
                  Tạo bộ thẻ riêng, tự động chuyển thẻ và chế độ lặp vô hạn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-lg border">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Tại sao chọn Flash Card App?
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">100% miễn phí</h3>
                  <p className="text-muted-foreground">
                    Tất cả tính năng đều miễn phí, không giới hạn số lượng thẻ
                    học
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Giao diện thân thiện
                  </h3>
                  <p className="text-muted-foreground">
                    Thiết kế đơn giản, dễ sử dụng với hiệu ứng GIF vui nhộn
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Responsive design
                  </h3>
                  <p className="text-muted-foreground">
                    Học mọi lúc mọi nơi trên mọi thiết bị: điện thoại, tablet,
                    máy tính
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Thuật toán thông minh
                  </h3>
                  <p className="text-muted-foreground">
                    Ưu tiên câu trả lời sai để tối ưu hiệu quả học tập
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Tham gia cùng hàng nghìn người học đang sử dụng Flash Card App
          </p>

          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/flashcards" className="flex items-center">
              Khám phá ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default App;
