const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Database Setup (SQLite) ---
const db = new sqlite3.Database('director_os.db', (err) => {
    if (err) console.error('DB Error:', err.message);
    else console.log('Connected to the SQLite database.');
});

// Initialize Schema
db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        name TEXT,
        role TEXT,
        avatarUrl TEXT,
        assigned_projects TEXT
    )`);

    // 2. Projects Table (Added customFields)
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        projectName TEXT,
        projectCode TEXT,
        businessType TEXT,
        pmId TEXT,
        profitTargetRate REAL,
        slaTargetRate REAL,
        status TEXT,
        customFields TEXT
    )`);

    // 3. PMs Table (NEW - Fixed Persistence Issue)
    db.run(`CREATE TABLE IF NOT EXISTS pms (
        id TEXT PRIMARY KEY,
        name TEXT,
        level TEXT,
        tags TEXT, -- JSON Array
        avatarUrl TEXT,
        customFields TEXT -- JSON Object
    )`);

    // 4. Metrics Table
    db.run(`CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        projectCode TEXT,
        reportWeek TEXT,
        revenueActual REAL,
        revenueTarget REAL,
        headcount INTEGER,
        slaAchieved REAL,
        turnoverRate REAL,
        riskFlag INTEGER,
        riskDetails TEXT
    )`);
    
    // 5. System Config Table (NEW)
    db.run(`CREATE TABLE IF NOT EXISTS config (
        id TEXT PRIMARY KEY,
        data TEXT -- JSON Object
    )`);

    // --- SEED DATA ---
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
            console.log("Seeding Database...");
            const stmtUser = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)");
            stmtUser.run('u1', 'director', 'Alex Director', 'DIRECTOR', 'https://ui-avatars.com/api/?name=Alex+Director&background=0D8ABC&color=fff', null);
            stmtUser.run('u2', 'pm', 'Sarah PM', 'PM', 'https://ui-avatars.com/api/?name=Sarah+PM&background=6366f1&color=fff', JSON.stringify(['Project_Alpha', 'Project_Sierra']));
            stmtUser.finalize();

            const stmtPm = db.prepare("INSERT INTO pms VALUES (?, ?, ?, ?, ?, ?)");
            stmtPm.run('pm-1', '王莎拉 (Sarah)', '高级项目经理', JSON.stringify(['运营强', '危机管理']), 'https://ui-avatars.com/api/?name=Sarah&background=random', '{}');
            stmtPm.run('pm-2', '张伟 (John)', '初级项目经理', JSON.stringify(['技术控', '沟通较弱']), 'https://ui-avatars.com/api/?name=John&background=random', '{}');
            stmtPm.finalize();

            const stmtProj = db.prepare("INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            stmtProj.run('proj-1', '招商银行 BPO', 'Project_Alpha', 'BPO', 'pm-1', 0.20, 0.95, 'Running', '{}');
            stmtProj.run('proj-2', '特斯拉客服支持', 'Project_Tango', 'RPO', 'pm-2', 0.15, 0.98, 'Ramp-up', '{}');
            stmtProj.finalize();
            
            const stmtMet = db.prepare("INSERT INTO metrics VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            stmtMet.run('met-1', 'Project_Alpha', '2023-10-23', 45000, 50000, 120, 0.96, 0.02, 0, '因呼入量低于预测，导致营收未达标。');
            stmtMet.finalize();

            const initialConfig = {
                riskThresholds: { revenueGap: 0.05, turnoverRate: 0.10 },
                resources: { templateUrl: 'https://example.com/template.xlsx', guideUrl: 'https://example.com/guide.pdf' },
                maintenanceMode: false
            };
            db.run("INSERT INTO config VALUES (?, ?)", ['global', JSON.stringify(initialConfig)]);
        }
    });
});

// --- API Endpoints ---

// 1. Login
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            const user = {
                ...row,
                assignedProjectCodes: row.assigned_projects ? JSON.parse(row.assigned_projects) : []
            };
            res.json({ user, token: 'mock-jwt-' + user.id });
        } else {
            res.status(401).json({ error: "用户不存在" });
        }
    });
});

// 2. Dashboard Data (Aggregated)
app.get('/api/dashboard', (req, res) => {
    const data = { projects: [], metrics: [], pms: [], tasks: [], config: {} };
    
    db.serialize(() => {
        // Load Projects
        db.all("SELECT * FROM projects", (err, rows) => {
            if (!err) data.projects = rows.map(r => ({...r, customFields: JSON.parse(r.customFields || '{}')}));
        });
        // Load PMs (Now from DB!)
        db.all("SELECT * FROM pms", (err, rows) => {
            if (!err) data.pms = rows.map(r => ({...r, tags: JSON.parse(r.tags || '[]'), customFields: JSON.parse(r.customFields || '{}')}));
        });
        // Load Metrics
        db.all("SELECT * FROM metrics", (err, rows) => {
            if (!err) data.metrics = rows.map(r => ({...r, riskFlag: !!r.riskFlag}));
        });
        // Load Config
        db.get("SELECT data FROM config WHERE id = 'global'", (err, row) => {
            if (!err && row) data.config = JSON.parse(row.data);
            
            // Mock Tasks (Still mock for now as per prompt focus on Admin/PMs)
            data.tasks = [
                { id: 'task-1', taskName: '财务 RPA 机器人', stage: 'Testing', progressPercent: 90 },
                { id: 'task-2', taskName: '智能质检系统', stage: 'In Progress', progressPercent: 45 }
            ];
            
            // Send Response
            res.json(data);
        });
    });
});

// 3. Upload Metrics
app.post('/api/upload', (req, res) => {
    const { metrics } = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO metrics VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    metrics.forEach(m => {
        stmt.run(m.id || Date.now().toString(), m.projectCode, m.reportWeek, m.revenueActual, m.revenueTarget, m.headcount, m.slaAchieved, m.turnoverRate, m.riskFlag ? 1 : 0, m.riskDetails);
    });
    stmt.finalize();
    res.json({ success: true, count: metrics.length });
});

// --- CRUD ENDPOINTS ---

// Users
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if(err) return res.status(500).json(err);
        res.json(rows.map(r => ({...r, assignedProjectCodes: JSON.parse(r.assigned_projects || '[]')})));
    });
});
app.post('/api/users', (req, res) => {
    const u = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(u.id, u.username, u.name, u.role, u.avatarUrl, JSON.stringify(u.assignedProjectCodes || []));
    stmt.finalize();
    res.json(u);
});
app.delete('/api/users/:id', (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", req.params.id, (err) => res.json({success: !err}));
});

// Projects
app.post('/api/projects', (req, res) => {
    const p = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(p.id, p.projectName, p.projectCode, p.businessType, p.pmId, p.profitTargetRate, p.slaTargetRate, p.status, JSON.stringify(p.customFields || {}));
    stmt.finalize();
    res.json(p);
});
app.put('/api/projects/:id', (req, res) => {
    const p = req.body;
    const stmt = db.prepare("UPDATE projects SET profitTargetRate=?, slaTargetRate=?, status=?, customFields=?, projectName=?, pmId=? WHERE id=?");
    stmt.run(p.profitTargetRate, p.slaTargetRate, p.status, JSON.stringify(p.customFields||{}), p.projectName, p.pmId, req.params.id);
    stmt.finalize();
    res.json(p);
});
app.delete('/api/projects/:id', (req, res) => {
    db.run("DELETE FROM projects WHERE id = ?", req.params.id, (err) => res.json({success: !err}));
});

// PMs (NEW ENDPOINTS)
app.post('/api/pms', (req, res) => {
    const p = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO pms VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(p.id, p.name, p.level, JSON.stringify(p.tags || []), p.avatarUrl, JSON.stringify(p.customFields || {}));
    stmt.finalize();
    res.json(p);
});
app.put('/api/pms/:id', (req, res) => {
    const p = req.body;
    const stmt = db.prepare("UPDATE pms SET name=?, level=?, tags=?, customFields=? WHERE id=?");
    stmt.run(p.name, p.level, JSON.stringify(p.tags||[]), JSON.stringify(p.customFields||{}), req.params.id);
    stmt.finalize();
    res.json(p);
});
app.delete('/api/pms/:id', (req, res) => {
    db.run("DELETE FROM pms WHERE id = ?", req.params.id, (err) => res.json({success: !err}));
});

// Config
app.put('/api/config', (req, res) => {
    const config = req.body;
    db.run("UPDATE config SET data = ? WHERE id = 'global'", [JSON.stringify(config)], (err) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(config);
    });
});

app.listen(PORT, () => {
    console.log(`Director OS Backend running on http://localhost:${PORT}`);
});
