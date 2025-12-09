import type { PathParams } from 'msw'
import { HttpResponse, http } from 'msw'

// Mock notification data
const mockNotifications = [
  {
    notificationId: 'notif-1',
    title: 'Welcome to Admin Dashboard',
    desc: 'Selamat datang di dashboard admin developer',
    htmlContent: '<p>Selamat datang di dashboard admin developer. Sistem siap digunakan.</p>',
    time: new Date().toISOString(),
    isRead: false,
    type: 'announcement',
  },
  {
    notificationId: 'notif-2',
    title: 'System Update',
    desc: 'Sistem telah diperbarui ke versi terbaru',
    htmlContent: '<p>Sistem telah diperbarui dengan fitur-fitur baru dan perbaikan bug.</p>',
    time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: false,
    type: 'announcement',
  },
  {
    notificationId: 'notif-3',
    title: 'Maintenance Notice',
    desc: 'Jadwal maintenance rutin',
    htmlContent: '<p>Maintenance rutin akan dilakukan pada hari Minggu pukul 02:00 WIB.</p>',
    time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isRead: true,
    type: 'announcement',
  },
]

export const handlerNotification = [
  // Get notifications
  http.get<PathParams>('*/notification/notifications', async ({ request }) => {
    const url = new URL(request.url)
    const authHeader = request.headers.get('authorization')

    // Check if user has valid token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { errors: { message: ['Unauthorized'] } },
        { status: 401 }
      )
    }

    const response = {
      success: true,
      data: mockNotifications,
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // Mark notification as read
  http.post<PathParams>('*/notification/notifications/:id/read', async ({ params }) => {
    const { id } = params
    const notification = mockNotifications.find(n => n.notificationId === id)

    if (notification) {
      notification.isRead = true
    }

    return HttpResponse.json(
      { success: true, message: 'Notification marked as read' },
      { status: 200 }
    )
  }),

  // Mark all notifications as read
  http.post<PathParams>('*/notification/notifications/read-all', async () => {
    mockNotifications.forEach(notif => {
      notif.isRead = true
    })

    return HttpResponse.json(
      { success: true, message: 'All notifications marked as read' },
      { status: 200 }
    )
  }),
]

