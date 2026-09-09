import { useState } from 'react';

const nodeDetailsData = {
  internet: {
    id: 'internet',
    name: 'INTERNET',
    status: 'ONLINE',
    ip: '0.0.0.0/0',
    mac: 'DE:AD:BE:EF:00:01',
    uptime: '99d 23h 59m',
    speed: '10 Gbps (Fiber)',
    icon: 'public',
    statusType: 'online',
    events: [
      { text: 'WAN Gateway Active', time: 'Today, 00:00:00', type: 'success' },
      { text: 'DNS Sync Verified', time: 'Today, 08:15:22', type: 'success' }
    ]
  },
  firewall: {
    id: 'firewall',
    name: 'FW-PRI-01',
    status: 'ONLINE',
    ip: '192.168.1.1',
    mac: '00:1B:44:11:3A:B7',
    uptime: '45d 12h 10m',
    speed: '10 Gbps (Full-Duplex)',
    icon: 'security',
    statusType: 'online',
    events: [
      { text: 'Threat Database Updated', time: 'Today, 11:30:00', type: 'success' },
      { text: '0 Blocked Intrusions', time: 'Last 24h', type: 'info' }
    ]
  },
  core: {
    id: 'core',
    name: 'SW-CORE-01',
    status: 'ONLINE',
    ip: '192.168.1.2',
    mac: '00:1A:2B:99:88:77',
    uptime: '62d 04h 15m',
    speed: '40 Gbps Trunk',
    icon: 'router',
    statusType: 'online',
    events: [
      { text: 'VLAN 10 Trunking OK', time: 'Today, 10:00:00', type: 'success' }
    ]
  },
  dist: {
    id: 'dist',
    name: 'SW-DIST-A',
    status: 'WARNING',
    ip: '192.168.1.5',
    mac: '00:1A:2B:44:55:66',
    uptime: '12d 08h 45m',
    speed: '1 Gbps (Degraded)',
    icon: 'device_hub',
    statusType: 'warning',
    events: [
      { text: 'Port Packet Loss 3.2%', time: 'Today, 14:15:00', type: 'warning' },
      { text: 'High Broadcast Storm Rate', time: 'Today, 14:00:10', type: 'warning' }
    ]
  },
  db: {
    id: 'db',
    name: 'DB-PROD-1',
    status: 'ONLINE',
    ip: '192.168.1.10',
    mac: '00:1A:2B:10:20:30',
    uptime: '14d 06h 32m',
    speed: '10 Gbps',
    icon: 'database',
    statusType: 'online',
    events: [
      { text: 'Automated Backup Completed', time: 'Today, 03:00:00', type: 'success' },
      { text: 'Replication Sync 100%', time: 'Today, 14:30:00', type: 'success' }
    ]
  },
  cctv: {
    id: 'cctv',
    name: 'CCTV-NVR-1',
    status: 'OFFLINE',
    ip: '192.168.45.112',
    mac: '00:1A:2B:3C:4D:5F',
    uptime: '00:00:00 (Down since 14:32)',
    speed: '1 Gbps (Auto-neg)',
    icon: 'videocam_off',
    statusType: 'offline',
    events: [
      { text: 'Connection Lost', time: 'Today, 14:32:05', type: 'error' },
      { text: 'Health Check OK', time: 'Today, 14:30:00', type: 'success' }
    ]
  },
  app: {
    id: 'app',
    name: 'APP-WEB-1',
    status: 'ONLINE',
    ip: '192.168.1.21',
    mac: '00:1A:2B:77:66:55',
    uptime: '28d 11h 05m',
    speed: '10 Gbps',
    icon: 'dns',
    statusType: 'online',
    events: [
      { text: 'HTTP/2 Service Healthy', time: 'Today, 14:25:00', type: 'success' }
    ]
  }
};

export default function NetworkTopology() {
  const [selectedNodeId, setSelectedNodeId] = useState('cctv');
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  const selectedNode = nodeDetailsData[selectedNodeId] || nodeDetailsData.cctv;

  const handlePing = () => {
    setPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setPinging(false);
      if (selectedNode.statusType === 'offline') {
        setPingResult('PING 192.168.45.112: 100% packet loss (Destination Host Unreachable)');
      } else {
        setPingResult(`PING ${selectedNode.ip}: 64 bytes from ${selectedNode.ip}: icmp_seq=1 ttl=64 time=1.24 ms`);
      }
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden flex flex-col md:flex-row rounded-2xl border border-indigo-900/30 bg-[#070b14]" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* Mobile scroll hint */}
      <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-indigo-950/60 border-b border-indigo-900/30 text-xs text-slate-400 font-mono shrink-0">
        <span className="material-symbols-outlined text-[14px] text-indigo-400">swipe</span>
        Scroll horizontally to explore the topology map
      </div>
      {/* Topology Canvas Area */}
      <div className="flex-1 relative w-full h-full overflow-auto" style={{ minHeight: '480px' }}>
        {/* Grid Background Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #818cf8 1px, transparent 0)', backgroundSize: '32px 32px' }}
        ></div>

        {/* Dynamic Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '900px', minHeight: '500px' }}>
          <path className="line-glow" d="M 150 120 L 300 240" fill="none" opacity="0.6" stroke="#34d399" strokeWidth="2" />
          <path className="line-glow" d="M 300 240 L 450 240" fill="none" opacity="0.6" stroke="#34d399" strokeWidth="2" />
          <path className="line-glow" d="M 450 240 L 600 140" fill="none" opacity="0.6" stroke="#34d399" strokeWidth="2" />
          <path className="line-error" d="M 450 240 L 600 240" fill="none" stroke="#fb7185" strokeDasharray="5,5" strokeWidth="2" />
          <path className="line-glow" d="M 450 240 L 600 340" fill="none" opacity="0.6" stroke="#34d399" strokeWidth="2" />
          <path className="line-glow" d="M 600 140 L 750 100" fill="none" opacity="0.6" stroke="#34d399" strokeWidth="2" />
          <path className="line-error" d="M 600 240 L 750 240" fill="none" stroke="#fb7185" strokeDasharray="5,5" strokeWidth="2" />
          <path className="line-glow" d="M 600 340 L 750 380" fill="none" opacity="0.6" stroke="#34d399" strokeWidth="2" />
        </svg>

        {/* Canvas Legend */}
        <div className="absolute top-4 left-4 z-10 glass-panel rounded-xl p-3 text-xs font-mono flex items-center gap-4 text-slate-300 border border-indigo-900/30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
            <span>Healthy Link</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
            <span>Critical Failure</span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="relative w-full h-full min-w-[850px] min-h-[480px]">
          {/* Internet */}
          <div 
            onClick={() => setSelectedNodeId('internet')}
            className={`absolute top-[100px] left-[130px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'internet' ? 'scale-110 ring-2 ring-indigo-400 rounded-full' : ''
            }`}
          >
            <div className="w-14 h-14 bg-indigo-950/80 border border-indigo-700/40 rounded-full flex items-center justify-center text-indigo-100 shadow-lg">
              <span className="material-symbols-outlined text-3xl text-emerald-400">public</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-200 bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">INTERNET</span>
          </div>

          {/* Firewall */}
          <div 
            onClick={() => setSelectedNodeId('firewall')}
            className={`absolute top-[220px] left-[300px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'firewall' ? 'scale-110 ring-2 ring-indigo-400 rounded-xl' : ''
            }`}
          >
            <div className="w-14 h-14 bg-indigo-950/80 border border-indigo-700/40 rounded-xl flex items-center justify-center text-indigo-100 shadow-lg">
              <span className="material-symbols-outlined text-3xl text-emerald-400">security</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-200 bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">FW-PRI-01</span>
          </div>

          {/* Core Switch */}
          <div 
            onClick={() => setSelectedNodeId('core')}
            className={`absolute top-[220px] left-[450px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'core' ? 'scale-110 ring-2 ring-indigo-400 rounded-xl' : ''
            }`}
          >
            <div className="w-16 h-16 bg-indigo-950/80 border border-indigo-700/40 rounded-xl flex items-center justify-center text-indigo-100 shadow-lg relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950"></div>
              <span className="material-symbols-outlined text-3xl text-emerald-400">router</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-200 bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">SW-CORE-01</span>
          </div>

          {/* Distribution Switch (Warning) */}
          <div 
            onClick={() => setSelectedNodeId('dist')}
            className={`absolute top-[220px] left-[600px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'dist' ? 'scale-110 ring-2 ring-amber-400 rounded-xl' : ''
            }`}
          >
            <div className="w-16 h-16 bg-indigo-950/80 border border-amber-500/50 rounded-xl flex items-center justify-center text-indigo-100 shadow-lg relative bg-amber-500/10">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-950 animate-pulse"></div>
              <span className="material-symbols-outlined text-3xl text-amber-400">device_hub</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-slate-950/90 px-2 py-0.5 rounded border border-amber-500/30 font-mono">SW-DIST-A</span>
          </div>

          {/* DB Server */}
          <div 
            onClick={() => setSelectedNodeId('db')}
            className={`absolute top-[100px] left-[750px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'db' ? 'scale-110 ring-2 ring-indigo-400 rounded-xl' : ''
            }`}
          >
            <div className="w-14 h-14 bg-indigo-950/80 border border-indigo-700/40 rounded-xl flex items-center justify-center text-indigo-100 shadow-lg">
              <span className="material-symbols-outlined text-2xl text-emerald-400">database</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-200 bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">DB-PROD-1</span>
          </div>

          {/* CCTV Server (Offline) */}
          <div 
            onClick={() => setSelectedNodeId('cctv')}
            className={`absolute top-[240px] left-[750px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'cctv' ? 'scale-110 ring-2 ring-rose-400 rounded-xl' : ''
            }`}
          >
            <div className="w-14 h-14 bg-rose-950/30 border border-rose-500 rounded-xl flex items-center justify-center text-rose-400 shadow-lg relative">
              <span className="material-symbols-outlined text-2xl text-rose-400">videocam_off</span>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-slate-950/90 px-2 py-0.5 rounded border border-rose-500/30 font-mono">CCTV-NVR-1</span>
            <span className="text-[9px] text-rose-400 font-mono bg-rose-950/50 px-1.5 rounded uppercase font-bold">OFFLINE</span>
          </div>

          {/* App Server */}
          <div 
            onClick={() => setSelectedNodeId('app')}
            className={`absolute top-[380px] left-[750px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer topology-node ${
              selectedNodeId === 'app' ? 'scale-110 ring-2 ring-indigo-400 rounded-xl' : ''
            }`}
          >
            <div className="w-14 h-14 bg-indigo-950/80 border border-indigo-700/40 rounded-xl flex items-center justify-center text-indigo-100 shadow-lg">
              <span className="material-symbols-outlined text-2xl text-emerald-400">dns</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-200 bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">APP-WEB-1</span>
          </div>
        </div>
      </div>

      {/* Side Inspector Panel */}
      <aside className="w-full md:w-[320px] bg-[#0b0f19] border-t md:border-t-0 md:border-l border-indigo-900/30 md:h-full flex flex-col glass-panel shrink-0 z-20">
        <div className="p-4 border-b border-indigo-900/30 flex justify-between items-center bg-indigo-950/40">
          <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-indigo-400">info</span>
            Node Inspector
          </h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedNode.id}</span>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Header Specs */}
          <div className="flex items-center gap-3 pb-4 border-b border-indigo-900/20">
            <div className={`w-12 h-12 border rounded-xl flex items-center justify-center ${
              selectedNode.statusType === 'offline' ? 'bg-rose-950/30 border-rose-500 text-rose-400' :
              selectedNode.statusType === 'warning' ? 'bg-amber-950/30 border-amber-400 text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            }`}>
              <span className="material-symbols-outlined text-2xl">{selectedNode.icon}</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-indigo-100">{selectedNode.name}</h4>
              <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold uppercase ${
                selectedNode.statusType === 'offline' ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30' :
                selectedNode.statusType === 'warning' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedNode.statusType === 'offline' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span> 
                {selectedNode.status}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex flex-col gap-0.5 border-b border-indigo-900/20 pb-2">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider font-sans">IP Address</span>
              <span className="text-indigo-100">{selectedNode.ip}</span>
            </div>

            <div className="flex flex-col gap-0.5 border-b border-indigo-900/20 pb-2">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider font-sans">MAC Address</span>
              <span className="text-indigo-100">{selectedNode.mac}</span>
            </div>

            <div className="flex flex-col gap-0.5 border-b border-indigo-900/20 pb-2">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider font-sans">Uptime</span>
              <span className={selectedNode.statusType === 'offline' ? 'text-rose-400' : 'text-indigo-100'}>
                {selectedNode.uptime}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 border-b border-indigo-900/20 pb-2">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider font-sans">Port Speed</span>
              <span className="text-slate-300">{selectedNode.speed}</span>
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <h5 className="text-xs font-semibold text-indigo-200 mb-3">Recent Events</h5>
            <ul className="space-y-2 font-sans">
              {selectedNode.events.map((evt, i) => (
                <li key={i} className={`flex items-start gap-2 p-2 rounded-xl text-xs ${
                  evt.type === 'error' ? 'bg-rose-950/30 text-rose-300 border border-rose-500/20' :
                  evt.type === 'warning' ? 'bg-amber-950/30 text-amber-300 border border-amber-500/20' :
                  'bg-indigo-950/60 text-slate-300 border border-indigo-800/30'
                }`}>
                  <span className="material-symbols-outlined text-[16px] mt-0.5">
                    {evt.type === 'error' ? 'error' : evt.type === 'warning' ? 'warning' : 'check_circle'}
                  </span>
                  <div>
                    <span className="block font-semibold">{evt.text}</span>
                    <span className="text-slate-400 text-[10px] font-mono">{evt.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Ping Command Output */}
          {pingResult && (
            <div className="p-3 bg-[#050811] border border-indigo-900/40 rounded-xl font-mono text-[10px] text-emerald-400 leading-relaxed break-all fade-in">
              {pingResult}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-indigo-900/30 bg-indigo-950/40">
          <button 
            onClick={handlePing}
            disabled={pinging}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold py-2.5 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/25"
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            {pinging ? 'Pinging Node...' : 'Ping Node'}
          </button>
        </div>
      </aside>
    </div>
  );
}
