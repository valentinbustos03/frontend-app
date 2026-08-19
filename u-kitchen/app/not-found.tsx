import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2 text-orange-600">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Página no encontrada</CardTitle>
              <CardDescription>La página que buscás no existe o fue movida.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href="/dashboard">Ir al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
