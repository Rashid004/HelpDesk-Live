import type { TicketAttachment } from "@repo/shared";

export function TicketAttachments({
  attachments,
}: {
  attachments: TicketAttachment[];
}): React.JSX.Element | null {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="label-brut">Attachments</p>
      <div className="flex flex-wrap gap-3">
        {attachments.map((a, i) => (
          <a
            key={`${a.fileUrl}-${i}`}
            href={a.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block border-2 border-ink rounded-brut overflow-hidden shadow-brut-sm press-brut"
          >
            {a.fileType === "image" ? (
              // Remote S3/CloudFront URLs of arbitrary origin — next/image
              // needs the domain allow-listed in next.config.js, which isn't
              // set up; a plain <img> is the pragmatic choice here.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.fileUrl} alt="Ticket attachment" className="size-28 object-cover" />
            ) : (
              <span className="size-28 grid place-items-center text-center text-xs font-bold px-2">
                📄 Document
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
