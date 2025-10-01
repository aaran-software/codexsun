// src/components/templates/ButtonDemo.tsx

import { Button } from "../components/ui/button";

export default function ButtonDemo() {
  return (
    <div className="space-x-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  );
}
