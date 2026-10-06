import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function App() {
  const [name, setName] = useState('')

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Bindee</CardTitle>
          <CardDescription>Enter your name to say hello.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {name && <p className="mt-3 text-sm">Hello, {name}!</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setName('')} disabled={!name}>
            Clear
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
