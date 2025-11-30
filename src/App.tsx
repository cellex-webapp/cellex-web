import AppRoute from './routes/AppRoute';
import { App as AntApp, message } from 'antd'; 

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
      <AppRoute />
    </AntApp>
  );
}

export default App;