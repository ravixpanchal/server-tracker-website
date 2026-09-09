import { useState, useEffect, useRef } from 'react';

const initialLogs = [
  { id: 1, time: '10:42:01', level: 'INFO', server: 'DB-SERVER-01', text: 'System boot sequence initiated' },
  { id: 2, time: '10:42:05', level: 'INFO', server: 'APP-SERVER-03', text: 'Connecting to primary cluster nodes' },
  { id: 3, time: '10:42:11', level: 'INFO', server: 'DB-SERVER-01', text: 'Heartbeat received from DB-SERVER-01' },
  { id: 4, time: '10:42:15', level: 'INFO', server: 'AUTH-SERVER-01', text: 'CPU usage: 42% on Node-Alpha' },
  { id: 5, time: '10:42:20', level: 'WARNING', server: 'APP-SERVER-03', text: 'Memory usage above threshold (88%) on APP-SERVER-03' },
  { id: 6, time: '10:42:25', level: 'INFO', server: 'APP-SERVER-03', text: 'Garbage collection triggered on APP-SERVER-03' },
  { id: 7, time: '10:42:31', level: 'ERROR', server: 'CACHE-NODE-02', text: 'Network connection timeout - Retrying route 10.4.22.1' },
  { id: 8, time: '10:42:35', level: 'CRITICAL', server: 'APP-SERVER-03', text: 'Server connection lost: APP-SERVER-03 completely unresponsive. Failover initiated.' },
];

export default function LiveLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [selectedServer, setSelectedServer] = useState('ALL SERVERS');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const terminalEndRef = useRef(null);

  // Simulated live log streaming
  useEffect(() => {
    if (isPaused) return;

    const streamInterval = setInterval(() => {
      const sampleMessages = [
        { level: 'INFO', server: 'DB-SERVER-01', text: 'Query execution time: 1.4ms [SELECT * FROM telemetry]' },
        { level: 'INFO', server: 'AUTH-SERVER-01', text: 'OAuth token refreshed for session #40912' },
        { level: 'WARNING', server: 'APP-SERVER-03', text: 'High TCP socket connection backlog detected' },
        { level: 'INFO', server: 'CACHE-NODE-02', text: 'Redis cache hit ratio: 99.4%' },
        { level: 'ERROR', server: 'CCTV-SERVER-02', text: 'Stream buffer overflow on channel 04' },
      ];
      const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

      setLogs(prev => [
        ...prev.slice(-100),
        {
          id: Date.now(),
          time: timeStr,
          level: randomMsg.level,
          server: randomMsg.server,
          text: randomMsg.text
        }
      ]);
    }, 3000);

    return () => clearInterval(streamInterval);
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (selectedServer !== 'ALL SERVERS' && log.server !== selectedServer) return false;
    if (selectedLevel !== 'All' && log.level.toUpperCase() !== selectedLevel.toUpperCase()) return false;
    if (searchTerm && !log.text.toLowerCase().includes(searchTerm.toLowerCase()) && !log.server.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleDownload = () => {
    const textContent = filteredLogs.map(l => `[${l.time}] [${l.level}] [${l.server}] ${l.text}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serverwatch_syslog_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 fade-in" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#d3e4fe]">Live Server Logs</h2>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 p-3 sm:p-4 bg-indigo-950/40 border border-indigo-800/30 rounded-2xl shadow-sm backdrop-blur-md">
          {/* Server Selector */}
          <div className="relative w-full sm:w-auto">
            <select 
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="appearance-none w-full bg-indigo-950/80 text-indigo-100 border border-indigo-800/40 rounded-xl py-2 pl-3 pr-8 text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option>ALL SERVERS</option>
              <option>DB-SERVER-01</option>
              <option>APP-SERVER-03</option>
              <option>AUTH-SERVER-01</option>
              <option>CACHE-NODE-02</option>
              <option>CCTV-SERVER-02</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>

          {/* Log Type Filter Pills */}
          <div className="flex items-center bg-indigo-950/80 border border-indigo-800/40 rounded-xl p-0.5 w-full sm:w-auto overflow-x-auto">
            {['All', 'Info', 'Warning', 'Error', 'Critical'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                  selectedLevel === level 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-indigo-200 hover:bg-indigo-900/30'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Search Grep */}
          <div className="relative w-full sm:flex-grow sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs (grep)..."
              className="w-full bg-indigo-950/80 text-indigo-100 border border-indigo-800/40 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          <div className="hidden sm:block sm:flex-grow"></div>

          {/* Toggles & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:border-indigo-900/30 sm:pl-3 w-full sm:w-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoScroll} 
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="hidden"
              />
              <div className={`w-8 h-4 rounded-full transition-colors relative border ${autoScroll ? 'bg-indigo-600/40 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-indigo-300 absolute top-0.5 transition-transform ${autoScroll ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </div>
              <span className="text-xs text-slate-300 whitespace-nowrap">Auto-scroll</span>
            </label>

            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-800/40 rounded-xl text-xs font-mono cursor-pointer transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button 
              onClick={handleDownload}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold font-mono cursor-pointer transition-all shadow-md shadow-indigo-600/25 whitespace-nowrap ml-auto sm:ml-0"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Download Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Interface */}
      <div className="flex-1 bg-[#050811] border border-indigo-900/40 rounded-2xl overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] relative" style={{ minHeight: '300px' }}>
        <div className="h-9 bg-[#0b0f19] border-b border-indigo-900/30 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <span className="ml-2 font-mono text-[10px] sm:text-xs text-slate-400 font-bold truncate">
              <span className="hidden sm:inline">root@serverwatch-noc:~# </span>tail -f /var/log/syslog
            </span>
          </div>

          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">STREAM </span>ACTIVE
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4 font-mono text-[10px] sm:text-xs text-slate-300 space-y-1">
          {filteredLogs.map((log) => {
            const isCrit = log.level === 'CRITICAL';
            const isErr = log.level === 'ERROR';
            const isWarn = log.level === 'WARNING';
            return (
              <div 
                key={log.id}
                className={`terminal-log-row flex flex-wrap sm:flex-nowrap gap-1 sm:gap-3 px-2 py-1 rounded-lg transition-colors ${
                  isCrit ? 'bg-rose-950/40 border-l-4 border-rose-400 shadow-[inset_0_0_15px_rgba(244,63,94,0.3)]' :
                  isErr ? 'bg-rose-950/20 border-l-2 border-rose-500' :
                  isWarn ? 'bg-amber-950/20 border-l-2 border-amber-400' : ''
                }`}
              >
                <span className="text-slate-500 shrink-0 w-16 sm:w-20">{log.time}</span>
                <span className={`shrink-0 w-20 sm:w-24 font-bold ${
                  isCrit ? 'text-rose-400 animate-pulse' :
                  isErr ? 'text-rose-400' :
                  isWarn ? 'text-amber-400' : 'text-indigo-400'
                }`}>
                  [{log.level}]
                </span>
                <span className="text-slate-400 shrink-0 hidden sm:inline-block sm:w-32">[{log.server}]</span>
                <span className={`flex-1 break-words min-w-0 ${isCrit ? 'text-rose-300 font-bold' : isErr ? 'text-rose-300' : 'text-slate-200'}`}>
                  <span className="sm:hidden text-slate-500">[{log.server}] </span>{log.text}
                </span>
              </div>
            );
          })}

          <div ref={terminalEndRef} className="mt-2 px-2 flex gap-2 items-center">
            <span className="w-2.5 h-4 bg-[#8c909f] animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
