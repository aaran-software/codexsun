// src/components/templates/CardDemo.tsx

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function CardDemo() {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Shadcn Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is an example of a card component.</p>
      </CardContent>
    </Card>
  );
}
