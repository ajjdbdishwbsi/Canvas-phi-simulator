// 重写控制台方法
(function() {
    const consoleOutput = document.getElementById('consoleOutput');
    
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    function addLogEntry(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        consoleOutput.appendChild(logEntry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
        
    console.log = function(...args) {
        originalLog.apply(console, args);
        addLogEntry(args.join(' '), 'info');
    };
        
    console.warn = function(...args) {
        originalWarn.apply(console, args);
        addLogEntry(args.join(' '), 'warn');
    };
        
    console.error = function(...args) {
        originalError.apply(console, args);
        addLogEntry(args.join(' '), 'error');
    };
})();