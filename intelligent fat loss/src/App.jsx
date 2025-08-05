import { 
  lazy,
  Suspense,
 } from 'react'
 import {
  Routes,
  Route,
 }from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import RequireAuth from './components/RequireAuth'

const Login = lazy(() => import('./pages/Login'));
const Diet = lazy(() => import('./pages/Diet'));
const Workout = lazy(() => import('./pages/Workout'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <>
      <Suspense fallback={<div className="loading-spinner">加载中...</div>}>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/diet' element={
            <RequireAuth>
              <Diet />
            </RequireAuth>
          } />
          <Route path='/workout' element={
            <RequireAuth>
              <Workout />
            </RequireAuth>
          } />
          <Route path='/settings' element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          } />
        </Routes>
      </Suspense>
      <NavBar />
    </>
  )
}

export default App;