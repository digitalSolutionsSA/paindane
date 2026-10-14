import { gallery } from '../content';
import { Camera } from './Icons';
import Picture from './Picture';

type Props = { onOpen: (index: number) => void };

export default function Gallery({ onOpen }: Props) {
  return (
    <div className="gallery-grid">
      {gallery.map((src, i) => (
        <button key={src} className="gallery-item" onClick={() => onOpen(i)} aria-label={`Open photo ${i + 1}`}>
          <Picture src={src} alt="" sizes="(max-width: 600px) 50vw, (max-width: 1240px) 33vw, 300px" />
          <span className="gallery-overlay">
            <Camera width={28} height={28} />
          </span>
        </button>
      ))}
    </div>
  );
}
