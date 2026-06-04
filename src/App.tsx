import AppRoute from './routes/AppRoute';
import { App as AntApp, message } from 'antd'; 

import { PendingPaymentProvider } from './contexts/PendingPaymentContext';

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  try {
    Object.assign(message, messageApi as any);
  } catch (e) {
    console.warn('Could not assign messageApi to global message', e);
  }

  return (
    <AntApp>
      {contextHolder}
      <PendingPaymentProvider>
        <AppRoute />
      </PendingPaymentProvider>
    </AntApp>
  );
}

export default App;