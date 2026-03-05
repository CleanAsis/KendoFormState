import '@progress/kendo-theme-default/dist/all.css';
import './App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { BasicExamplesTab } from './components/BasicExamplesTab';
import { ZustandTab } from './components/ZustandTab';
import { RenderLogPanel } from './components/RenderLogPanel';

const TAB_ROUTES = ['/', '/zustand'] as const;

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedTab = Math.max(
    0,
    TAB_ROUTES.indexOf(location.pathname as (typeof TAB_ROUTES)[number]),
  );

  const handleSelect = (e: { selected: number }) => {
    navigate(TAB_ROUTES[e.selected]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kendo Form State POC</h1>
        <p className="subtitle">
          A proof-of-concept exploring different strategies for reading,
          copying, and synchronising form state across multiple KendoReact
          forms.
        </p>
      </header>

      <div className="tab-container">
        <TabStrip selected={selectedTab} onSelect={handleSelect}>
          <TabStripTab title="Basic Examples">
            <BasicExamplesTab />
          </TabStripTab>

          <TabStripTab title="Zustand">
            <ZustandTab />
          </TabStripTab>
        </TabStrip>
      </div>

      <RenderLogPanel />
    </div>
  );
}

export default App;
