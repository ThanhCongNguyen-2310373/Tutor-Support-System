import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { wsService } from '../utils/websocket';
import { addNotification, incrementUnreadCount } from '../store/slices/notificationsSlice';
import { toast } from 'react-toastify';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const isConnected = useRef(false);

  useEffect(() => {
    if (token && !isConnected.current) {
      // Connect WebSocket
      wsService.connect(token);
      isConnected.current = true;

      // Listen for new notifications
      const handleNewNotification = (notification) => {
        console.log('🔔 New notification received:', notification);
        
        // Add to Redux store
        dispatch(addNotification(notification));
        dispatch(incrementUnreadCount());

        // Show toast notification
        const toastOptions = {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        };

        switch (notification.priority) {
          case 'urgent':
            toast.error(notification.message, toastOptions);
            break;
          case 'high':
            toast.warning(notification.message, toastOptions);
            break;
          default:
            toast.info(notification.message, toastOptions);
        }
      };

      wsService.on('notification', handleNewNotification);

      // Cleanup on unmount
      return () => {
        wsService.off('notification', handleNewNotification);
        wsService.disconnect();
        isConnected.current = false;
      };
    }
  }, [token, dispatch]);

  return {
    isConnected: wsService.isConnected(),
    emit: wsService.emit.bind(wsService),
  };
};
