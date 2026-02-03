import { useState } from 'react';
import { Header } from './components/Header';
import { ProjectList } from './components/ProjectList';
import { Dashboard } from './components/Dashboard';
import { EmptyState } from './components/EmptyState';
import { mockProjects } from './data/mockProjects';
import type { Project } from './types';
import './styles/qualtrics.css';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  return (
    <div className="q-app">
      <Header activeNav="projects" />
      <main className="q-main">
        {selectedProject ? (
          <Dashboard project={selectedProject} onBack={handleBack} />
        ) : (
          <div>
            <h1 className="q-page-title">Your Projects</h1>
            <p style={{ color: '#5F6368', marginBottom: '24px' }}>
              Select a project to view its dashboard. Projects with open-ended responses will show Text iQ insights.
            </p>
            {mockProjects.length > 0 ? (
              <ProjectList
                projects={mockProjects}
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
              />
            ) : (
              <EmptyState
                title="No Projects"
                message="You don't have any projects yet. Create a new survey to get started."
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
