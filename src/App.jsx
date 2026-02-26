
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import Homepage from './pages/Homepage';
import MainLayout from './layouts/MainLayout';
import LandingLayout from './layouts/LandingLayout';
import IssueCertificate from './pages/IssueCertificate';
import ViewCertificate from './pages/ViewCertificate';

import AdminDashboard from './pages/AdminDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import StudentDashboard from './pages/StudentDashboard';

function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <>
      {/* Landing Page Route */}
      <Route path='/' element={<LandingLayout />}>
        <Route index element={<Homepage />} />
      </Route>

      {/* App Dashboard Routes */}
      <Route element={<MainLayout />}>
        <Route path='/dashboard' element={<AdminDashboard />} />
        <Route path='/student' element={<StudentDashboard />} />
        <Route path='/issuecertificate' element={<IssueCertificate />} />
        <Route path='/viewcertificate/:id' element={<ViewCertificate />} />
      </Route>
      <Route path='/verify' element={<VerifyCertificate />} />
    </>
  ))

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App