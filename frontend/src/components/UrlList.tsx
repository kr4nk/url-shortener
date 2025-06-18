import UrlItem from './UrlItem';
import type { UrlEntry } from '../types';

type Props = {
  urls: UrlEntry[];
  onDelete: (shortUrl: string) => void;
};

export default function UrlList({ urls, onDelete }: Props) {
  return (
    <div class='flex flex-col gap-4 mx-2'>
      {urls.map((url) => (
        <UrlItem key={url.shortUrl} url={url} onDelete={onDelete} />
      ))}
    </div>
  );
}
