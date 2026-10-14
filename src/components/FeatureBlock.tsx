import type { Feature } from '../content';
import { Camera } from './Icons';
import Picture from './Picture';

type Props = {
  feature: Feature;
  onOpenImage: (src: string) => void;
};

export default function FeatureBlock({ feature: f, onOpenImage }: Props) {
  const textFirst = f.imageSide === 'right';
  return (
    <div className={`feature ${textFirst ? 'feature--img-right' : 'feature--img-left'}`}>
      <button
        className="feature-media"
        data-clip
        onClick={() => onOpenImage(f.image)}
        aria-label={`View photo${f.title ? `: ${f.title}` : ''}`}
      >
        <Picture src={f.image} alt={f.title ?? ''} sizes="(max-width: 960px) 100vw, 66vw" img={{ 'data-parallax': true }} />
        <span className="feature-media-icon">
          <Camera width={26} height={26} />
        </span>
      </button>

      <div className={`feature-card tone-${f.tone}`} data-float>
        {f.title && <h2 data-split>{f.title}</h2>}
        {f.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {f.list && (
          <ul className="ticks">
            {f.list.map((li) => {
              const [head, ...rest] = li.split(':');
              return (
                <li key={li}>
                  {rest.length ? (
                    <>
                      <strong>{head}:</strong>
                      {rest.join(':')}
                    </>
                  ) : (
                    li
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {f.links && (
          <p>
            {f.links.before}
            {f.links.items.map((it) => (
              <span key={it.link.href}>
                <a href={it.link.href} target="_blank" rel="noreferrer">
                  {it.link.label}
                </a>
                {it.after}
              </span>
            ))}
          </p>
        )}
        {f.subheading && <h3 className="subheading">{f.subheading}</h3>}
        {f.subLink && (
          <p>
            {f.subLink.before}
            <a href={f.subLink.link.href} target="_blank" rel="noreferrer">
              {f.subLink.link.label}
            </a>
            {f.subLink.after}
          </p>
        )}
        {f.footnote && <p className="footnote">{f.footnote}</p>}
      </div>
    </div>
  );
}
