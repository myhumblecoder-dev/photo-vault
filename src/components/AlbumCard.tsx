import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';

interface AlbumCardProps {
  id: string;
  name: string;
  createdAt: Date;
  href: string;
}

export default function AlbumCard({ id, name, createdAt, href }: AlbumCardProps) {
  return (
    <Card>
      <Link href={href} data-testid="album-link">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {format(createdAt, 'MMM d, yyyy')}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}