// Meridian docs demos — files.

// @demo Attachment File states and actions
export function AttachmentDemo() {
  const { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger, Icon } = window.EfolusiDesignSystem_4ffc3d;
  const files = [
    ['design-system.zip', 'Uploading · 64%', 'uploading'],
    ['market-research.pdf', 'Processing document', 'processing'],
    ['financial-model.xlsx', 'Upload failed. Try again.', 'error'],
  ];
  return (
    <AttachmentGroup role="group" aria-label="Project files" tabIndex={0} style={{ width: '100%', maxWidth: 720 }}>
      {files.map(([name, description, state]) => (
        <Attachment key={name} state={state} style={{ width: 250 }}>
          <AttachmentMedia><Icon name="file-text" size={17} /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{name}</AttachmentTitle>
            <AttachmentDescription>{description}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction variant="ghost" aria-label={`Remove ${name}`}><Icon name="x" size={13} /></AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger aria-label={`Open ${name}`} onClick={() => {}} />
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

// @demo FileDrop Upload target
export function FileDropDemo() {
  const { FileDrop } = window.EfolusiDesignSystem_4ffc3d;
  const [names, setNames] = React.useState([]);
  return (
    <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <FileDrop title="Drop receipts here" hint="PDF or PNG, up to 25 MB" accept=".pdf,.png" onFiles={(fs) => setNames(fs.map(f => f.name))} />
      {names.length ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Received: {names.join(', ')}</span> : null}
    </div>
  );
}

// @demo FileTile Upload states
export function FileTileDemo() {
  const { FileTile } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 440 }}>
      <FileTile name="itinerary.pdf" size="1.2 MB" kind="doc" status="Uploaded" onRemove={() => {}} />
      <FileTile name="receipts-q3.zip" size="18 MB" kind="archive" progress={62} status="Uploading…" />
      <FileTile name="board-deck.key" size="240 MB" kind="doc" error="File exceeds the 25 MB limit." onRemove={() => {}} />
    </div>
  );
}

// @demo FileTypeIcon Extension glyphs
export function FileTypeIconDemo() {
  const { FileTypeIcon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
      <FileTypeIcon ext="pdf" />
      <FileTypeIcon ext="csv" />
      <FileTypeIcon ext="png" />
      <FileTypeIcon ext="zip" />
      <FileTypeIcon ext="js" size={52} />
    </div>
  );
}
