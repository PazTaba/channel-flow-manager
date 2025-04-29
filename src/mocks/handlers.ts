// // src/mocks/handlers.ts
// import { http } from 'msw';
// import {
//   mockChannels,
//   mockSources,
//   mockDestinations,
//   mockUsers,
//   mockDashboardStats,
//   mockSystemAlerts,
//   paginateData,
//   mockBandwidthData
// } from './mockData';

// let currentId = 1000;

// export const handlers = [
// //@ts-ignore
//   http.get('/api/dashboard/status', (_, res, ctx) =>
//     res(ctx.delay(500), ctx.json(mockDashboardStats))
//   ),
// //@ts-ignore
//   http.get('/api/dashboard/bandwidth', (_, res, ctx) =>
//     res(ctx.delay(500), ctx.json(mockBandwidthData))
//   ),
// //@ts-ignore
//   http.get('/api/dashboard/channels/top', (req, res, ctx) => {
//     const limit = Number(req.url.searchParams.get('limit') || 3);
//     const sorted = [...mockChannels].sort((a, b) =>
//       parseFloat(b.bandwidth) - parseFloat(a.bandwidth)
//     );
//     return res(ctx.json(sorted.slice(0, limit)));
//   }),

//   // 🟦 Auth
// //@ts-ignore
// http.post('/api/auth/refresh', (req, res, ctx) => {
//   return res(
//     ctx.delay(300),
//     ctx.status(200),
//     ctx.json({
//       access_token: 'mock_access_token',
//       refresh_token: 'mock_refresh_token',
//       expires_in: 3600,
//       token_type: 'Bearer',
//     })
//   );
// }),


// //@ts-ignore
// http.post('/api/auth/login', async (req, res, ctx) => {
//   const body = await req.json();
//   const { username, password } = body;

//   const user = mockUsers.find(u => u.username === username && password === 'password');

//   if (!user) {
//     return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
//   }

//   return res(
//     ctx.status(200),
//     ctx.json({
//       access_token: 'mock_access_token',
//       refresh_token: 'mock_refresh_token',
//       expires_in: 3600,
//       token_type: 'Bearer',
//     })
//   );
// }),


//   //@ts-ignore// 🟩 Sources
//   http.get('/api/sources', (req, res, ctx) => {
//     const page = Number(req.url.searchParams.get('page') || '1');
//     const pageSize = Number(req.url.searchParams.get('pageSize') || '10');
//     return res(ctx.delay(500), ctx.json(paginateData(mockSources, page, pageSize)));
//   }),
// //@ts-ignore
//   http.get('/api/sources/:id', (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const source = mockSources.find(s => s.id === id);
//     return source
//       ? res(ctx.delay(300), ctx.json(source))
//       : res(ctx.status(404), ctx.json({ message: 'Source not found' }));
//   }),
// //@ts-ignore
//   http.post('/api/sources', async (req, res, ctx) => {
//     const body = await req.json();
//     const newSource = { id: ++currentId, ...body };
//     mockSources.push(newSource);
//     return res(ctx.status(201), ctx.json(newSource));
//   }),
// //@ts-ignore
//   http.put('/api/sources/:id', async (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const source = mockSources.find(s => s.id === id);
//     const body = await req.json();
//     if (!source) return res(ctx.status(404));
//     Object.assign(source, body);
//     return res(ctx.json(source));
//   }),

//   //@ts-ignore// 🟥 Channels
//   http.get('/api/channels', (req, res, ctx) => {
//     const page = Number(req.url.searchParams.get('page') || '1');
//     const pageSize = Number(req.url.searchParams.get('pageSize') || '10');
//     return res(ctx.delay(500), ctx.json(paginateData(mockChannels, page, pageSize)));
//   }),
// //@ts-ignore
//   http.get('/api/channels/:id', (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const channel = mockChannels.find(c => c.id === id);
//     return channel
//       ? res(ctx.delay(300), ctx.json(channel))
//       : res(ctx.status(404), ctx.json({ message: 'Channel not found' }));
//   }),
// //@ts-ignore
//   http.post('/api/channels', async (req, res, ctx) => {
//     const body = await req.json();
//     const newChannel = { id: ++currentId, ...body };
//     mockChannels.push(newChannel);
//     return res(ctx.status(201), ctx.json(newChannel));
//   }),
// //@ts-ignore
//   http.put('/api/channels/:id', async (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const channel = mockChannels.find(c => c.id === id);
//     const body = await req.json();
//     if (!channel) return res(ctx.status(404));
//     Object.assign(channel, body);
//     return res(ctx.json(channel));
//   }),
// //@ts-ignore
//   http.patch('/api/channels/:id/activate', (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const channel = mockChannels.find(c => c.id === id);
//     if (!channel) return res(ctx.status(404));
//     channel.status = 'active';
//     return res(ctx.json(channel));
//   }),
// //@ts-ignore
//   http.patch('/api/channels/:id/standby', (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const channel = mockChannels.find(c => c.id === id);
//     if (!channel) return res(ctx.status(404));
//     channel.status = 'standby';
//     return res(ctx.json(channel));
//   }),

//   //@ts-ignore// 🟥 Destinations
//   http.get('/api/destinations', (req, res, ctx) => {
//     const page = Number(req.url.searchParams.get('page') || '1');
//     const pageSize = Number(req.url.searchParams.get('pageSize') || '10');
//     return res(ctx.delay(500), ctx.json(paginateData(mockDestinations, page, pageSize)));
//   }),
// //@ts-ignore
//   http.get('/api/destinations/:id', (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const dest = mockDestinations.find(d => d.id === id);
//     return dest
//       ? res(ctx.delay(300), ctx.json(dest))
//       : res(ctx.status(404), ctx.json({ message: 'Destination not found' }));
//   }),

//   //@ts-ignore// 🟪 Users
//   http.get('/api/users', (req, res, ctx) => {
//     const page = Number(req.url.searchParams.get('page') || '1');
//     const pageSize = Number(req.url.searchParams.get('pageSize') || '10');
//     return res(ctx.delay(500), ctx.json(paginateData(mockUsers, page, pageSize)));
//   }),
// //@ts-ignore
//   http.get('/api/users/:id', (req, res, ctx) => {
//     const id = Number(req.params.id);
//     const user = mockUsers.find(u => u.id === id);
//     return user
//       ? res(ctx.delay(300), ctx.json(user))
//       : res(ctx.status(404), ctx.json({ message: 'User not found' }));
//   }),

  

//   //@ts-ignore// 📡 Logs
//   http.get('/api/logs', (req, res, ctx) => {
//     const page = Number(req.url.searchParams.get('page') || '1');
//     const pageSize = Number(req.url.searchParams.get('pageSize') || '20');
//     const level = req.url.searchParams.get('level');

//     const all = Array.from({ length: 100 }, (_, i) => ({
//       id: i + 1,
//       timestamp: new Date(Date.now() - i * 1000 * 60).toISOString(),
//       level: ['info', 'warning', 'error', 'debug'][i % 4],
//       message: `Log message #${i + 1}`,
//       service: ['api', 'auth', 'scheduler'][i % 3]
//     }));

//     const filtered = level ? all.filter(log => log.level === level) : all;

//     return res(ctx.delay(500), ctx.json(paginateData(filtered, page, pageSize)));
//   }),
// //@ts-ignore
//   http.get('/api/logs/download', (req, res, ctx) => {
//     const format = req.url.searchParams.get('format') || 'json';
//     const content = JSON.stringify({ message: 'Mock log content' }, null, 2);
//     return res(
//       ctx.set('Content-Disposition', `attachment; filename="logs.${format}"`),
//       ctx.set('Content-Type', format === 'json' ? 'application/json' : 'text/plain'),
//       ctx.body(content)
//     );
//   }),

//   //@ts-ignore// 🔔 Alerts
//   http.get('/api/alerts', (req, res, ctx) =>
//     res(ctx.delay(300), ctx.json(paginateData(mockSystemAlerts, 1, 10)))
//   )
// ];