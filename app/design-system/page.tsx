import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

export default function DesignSystemPage() {
    return (
        <div className="container mx-auto py-10 space-y-10">
            <div className="space-y-4">
                <Text variant="h1">Design System</Text>
                <Text variant="lead">
                    A showcase of our custom, atomic UI components.
                </Text>
            </div>

            <section className="space-y-4">
                <Text variant="h2">Typography</Text>
                <div className="space-y-2 border p-4 rounded-lg">
                    <Text variant="h1">Heading 1</Text>
                    <Text variant="h2">Heading 2</Text>
                    <Text variant="h3">Heading 3</Text>
                    <Text variant="p">Paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                    <Text variant="blockquote">Blockquote text for quotes.</Text>
                    <Text variant="small">Small text for captions.</Text>
                    <Text variant="muted">Muted text for secondary information.</Text>
                </div>
            </section>

            <section className="space-y-4">
                <Text variant="h2">Buttons</Text>
                <div className="flex flex-wrap gap-4 border p-4 rounded-lg items-center">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">Icon</Button>
                </div>
            </section>

            <section className="space-y-4">
                <Text variant="h2">Badges</Text>
                <div className="flex flex-wrap gap-4 border p-4 rounded-lg">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                </div>
            </section>

            <section className="space-y-4">
                <Text variant="h2">Form Elements</Text>
                <div className="grid max-w-sm gap-4 border p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Label</Label>
                        <Input type="email" id="email" placeholder="Email input" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="select">Select Label</Label>
                        <Select id="select">
                            <option>Option 1</option>
                            <option>Option 2</option>
                        </Select>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <Text variant="h2">Cards</Text>
                <div className="grid md:grid-cols-2 gap-4 border p-4 rounded-lg">
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Text>Card content goes here.</Text>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Interactive Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Text>Some content with actions.</Text>
                                <Button className="w-full">Action</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
