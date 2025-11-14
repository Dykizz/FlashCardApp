import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
interface ExampleProps {
  setDependencies: (deps: { left: string; right: string }[]) => void;
  setIsSolved: (solved: boolean) => void;
  setSolution: (solution: string) => void;
}
export default function Example({
  setDependencies,
  setIsSolved,
  setSolution,
}: ExampleProps) {
  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Ví dụ</CardTitle>
        <CardDescription>Các ví dụ phổ biến</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full p-3 cursor-pointer h-auto whitespace-normal text-left justify-start"
          onClick={() => {
            setIsSolved(false);
            setDependencies([
              { left: "AB", right: "C" },
              { left: "C", right: "A" },
              { left: "BC", right: "D" },
              { left: "ACD", right: "B" },
              { left: "D", right: "EG" },
              { left: "BE", right: "C" },
              { left: "C", right: "D" },
              { left: "CE", right: "G" },
            ]);
            setSolution("");
          }}
        >
          <span className="text-left text-sm text-muted-foreground wrap-break-word whitespace-normal text-wrap">
            <b>Ví dụ 1:</b> AB → C, C → A, BC → D, ACD → B, D → EG, BE → C, C →
            D, CE → G
          </span>
        </Button>

        <Button
          variant="outline"
          className="w-full p-3 cursor-pointer h-auto whitespace-normal text-left justify-start"
          onClick={() => {
            setIsSolved(false);
            setDependencies([
              { left: "A", right: "B" },
              { left: "B", right: "C" },
              { left: "C", right: "D" },
            ]);
            setSolution("");
          }}
        >
          <span className="text-left text-sm text-muted-foreground wrap-break-word whitespace-normal text-wrap">
            <b>Ví dụ 2: </b> A → B, B → C, C → D
          </span>
        </Button>

        <Separator />

        <div className="text-sm space-y-2">
          <h4 className="font-semibold">Hướng dẫn:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Vế trái: Nhập các thuộc tính (VD: A, AB, ABC)</li>
            <li>Vế phải: Nhập các thuộc tính (VD: B, CD)</li>
            <li>Không cần nhập ký hiệu →</li>
            <li>Có thể nhập nhiều thuộc tính liền nhau</li>
            <li className="text-red-500 dark:text-red-300">
              <strong>Lưu ý:</strong> Chỉ chấp nhận các thuộc tính a-z, A-Z, 0-9
              và viết liền. Hệ thống sẽ phân biệt viết hoa và thường. Với thuộc
              tính dài vui lòng sử dụng tính năng Mapping
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
