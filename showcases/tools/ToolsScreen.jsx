const { Steps, FileDrop, FileTile, Select, Slider, Button, EmptyState, Toast, ToastStack, Card, Divider, SegmentedControl, Icon, Textarea, CopyField } = window.EfolusiDesignSystem_4ffc3d;

function EncodePane() {
  const [scheme, setScheme] = React.useState('base64');
  const [text, setText] = React.useState('Wise moves, warm tools.');
  const [out, setOut] = React.useState('');
  const run = decode => {
    try {
      if (scheme === 'base64') setOut(decode ? atob(text) : btoa(text));
      else if (scheme === 'url') setOut(decode ? decodeURIComponent(text) : encodeURIComponent(text));
      else setOut(decode
        ? (text.match(/.{1,2}/g) || []).map(h => String.fromCharCode(parseInt(h, 16))).join('')
        : [...text].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
    } catch (e) { setOut('Could not ' + (decode ? 'decode' : 'encode') + ' that input.'); }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SegmentedControl value={scheme} onChange={setScheme} options={[{ id: 'base64', label: 'Base64' }, { id: 'url', label: 'URL' }, { id: 'hex', label: 'Hex' }]} />
      <Textarea label="Input" rows={3} value={text} onChange={e => setText(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button iconLeft="code" onClick={() => run(false)}>Encode</Button>
        <Button variant="secondary" iconLeft="refresh-cw" onClick={() => run(true)}>Decode</Button>
      </div>
      {out && <CopyField label="Output" value={out} />}
    </div>
  );
}

let nextId = 10;
function ToolsScreen() {
  const [tool, setTool] = React.useState('convert');
  const [files, setFiles] = React.useState([
    { id: 1, name: 'q3-deck.pdf', size: '1.2 MB', state: 'ready' },
    { id: 2, name: 'hero-final.mp4', size: '48 MB', state: 'ready' },
  ]);
  const [format, setFormat] = React.useState('DOCX');
  const [quality, setQuality] = React.useState(80);
  const [phase, setPhase] = React.useState(0); // 0 upload, 1 convert, 2 download
  const [toast, setToast] = React.useState(null);
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearInterval), []);
  const addFiles = fs => setFiles(f => [...f, ...fs.map(x => ({ id: nextId++, name: x.name, size: (x.size / 1048576).toFixed(1) + ' MB', state: 'ready' }))]);
  const convert = () => {
    setPhase(1);
    setFiles(fs => fs.map(f => f.state === 'done' ? f : { ...f, state: 'working', pct: 0 }));
    const t = setInterval(() => {
      setFiles(fs => {
        const out = fs.map(f => f.state === 'working' ? (f.pct >= 100 ? { ...f, state: 'done', pct: undefined } : { ...f, pct: f.pct + 7 + Math.random() * 10 }) : f);
        if (out.every(f => f.state === 'done')) {
          clearInterval(t);
          setPhase(2);
          setToast('Everything converted');
        }
        return out;
      });
    }, 180);
    timers.current.push(t);
  };
  const remove = id => setFiles(f => f.filter(x => x.id !== id));
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1040, width: '100%', margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <a href="../console/index.html" title="Back to Console" style={{ display: 'inline-flex' }}><img src="../../assets/logo.png" alt="" style={{ width: 32, height: 32 }} /></a>
          <h1 style={{ fontSize: 26, fontWeight: 680 }}>File tools</h1>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 15, marginTop: 8 }}>Convert, encode, and scan any file. Nothing leaves your workspace.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <SegmentedControl value={tool} onChange={setTool} options={[
            { id: 'convert', label: 'Convert', icon: 'refresh-cw' },
            { id: 'encode', label: 'Encode / decode', icon: 'code' },
            { id: 'scan', label: 'Scan', icon: 'scan' },
          ]} />
        </div>
        <Card padding={24} style={{ marginTop: 24 }}>
          <Steps orientation="horizontal" current={phase} items={[
            { title: 'Upload', description: files.length + (files.length === 1 ? ' file' : ' files') },
            { title: 'Convert', description: 'to ' + format },
            { title: 'Download' },
          ]} />
          <Divider style={{ margin: '20px 0' }} />
          {tool === 'convert' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FileDrop accept="*/*" hint="PDF, MP4, PNG, DOCX — up to 2 GB each" onFiles={addFiles} />
              {files.length === 0 && <EmptyState icon="files" title="Add your first file" description="Everything you drop here stays in this workspace." />}
              {files.map(f => (
                <FileTile key={f.id} name={f.name} size={f.size}
                  progress={f.state === 'working' ? Math.min(99, f.pct) : undefined}
                  status={f.state === 'done' ? 'Converted to ' + format : f.state === 'ready' ? 'Queued' : undefined}
                  actions={f.state === 'done' ? <Button size="sm" variant="secondary" iconLeft="download">Download</Button> : null}
                  onRemove={f.state === 'working' ? undefined : () => remove(f.id)} />
              ))}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', marginTop: 6 }}>
                <Select label="Convert to" options={['DOCX', 'PDF', 'PNG', 'WEBM', 'MP3', 'TXT']} value={format} onChange={e => setFormat(e.target.value)} style={{ width: 160 }} />
                <Slider label="Quality" showValue format={v => v + '%'} value={quality} onChange={setQuality} style={{ flex: 1 }} />
                <Button iconLeft="refresh-cw" disabled={files.length === 0 || phase === 1} loading={phase === 1} onClick={convert}>{phase === 1 ? 'Converting' : 'Convert all'}</Button>
              </div>
            </div>
          ) : tool === 'encode' ? (
            <EncodePane />
          ) : (
            <EmptyState bordered icon="scan" title="Scanner" description="Intentionally omitted from this kit — the Convert flow is the reference layout." />
          )}
        </Card>
      </div>
      <ToastStack>{toast && <Toast tone="success" title={toast} description="Files are ready to download." onClose={() => setToast(null)} />}</ToastStack>
    </div>
  );
}

Object.assign(window, { ToolsScreen });
