import { Counter } from "@/components/Counter";
import { Card } from "@/components/ui/card";

// The page component is a server component by default, so you can use async/await
export default async function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen max-h-[100vh] max-w-full p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Card>
          <Counter />
        </Card>
      </main>
    </div>
  );
}
