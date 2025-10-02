import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Discovery from './components/discovery/Discovery';
import PrivateRouteAdmin from './components/room_admin/login/PrivateRouteAdmin';
import PrivateRoute from './components/login/PrivateRoute';
// Language
import { useTranslation } from 'react-i18next';
import Spinner from './components/spinner/Spinner';
import TestRoom from './components/room/TestRoom';
//Lazy component
const LoginForm = React.lazy(() => import('./components/login/LoginForm'));
const LineCallback = React.lazy(() => import('./components/login/LineCallback'));
const SignupForm = React.lazy(() => import('./components/login/SignupForm'));
const DashBoard = React.lazy(() => import('./components/home/DashBoard'));
// const Room = React.lazy(() => import('./components/room/Room'));
const ForgotPassword = React.lazy(() => import('./components/forgotpwd/forgotPassword'));
const AccountPage = React.lazy(() => import('./components/profile/AccountPage'));
const UserProfileCard = React.lazy(() => import('./components/introProfile/UserProfileCard'));
const UserProfileFormCreator = React.lazy(() => import('./components/introProfile/UserProfileCardCreator'));
const UserProfileFormModify = React.lazy(() => import('./components/introProfile/UserProfileCardModify'));
const CouponCard = React.lazy(() => import('./components/coupon/CouponCard'));

const QuizRoom = React.lazy(() => import('./components/room/test'));
const QuestionPage = React.lazy(() => import('./components/room/QuestionPage.jsx'));
// const QuizResults = React.lazy(() => import('./components/room/QuizResults'));
const RoomSetup = React.lazy(() => import('./components/room/RoomSetup'));


// Admin Components
const AdminLogin = React.lazy(() => import('./components/room_admin/login/adminLogin'));
const Panel = React.lazy(() => import('./components/room_admin/dashboardadmin/dashboard'));
const GameRoomManager = React.lazy(() => import('./components/room_admin/room_manager/GameRoomManager'));
const UserManager = React.lazy(() => import('./components/room_admin/usermanager/UserManager'));
const ProfileForm = React.lazy(() => import('./components/room_admin/profile/ProfileForm'));
const ReportManager = React.lazy(() => import('./components/room_admin/reportManager/ReportManager'));
// Terms and Conditions Component
const Terms = React.lazy(() => import('./components/termsConditions/Terms'));

const HomePage = React.lazy(() => import('./components/homepage/HomePage'));
const NotFound = React.lazy(() => import('./components/404/404'));

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = localStorage.getItem('language');
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [i18n]);

    // Wrapper cho PrivateRoute + QuestionPage
  const PrivateQuestionPageWrapper = () => {
    const { roomId, questionNumber } = useParams();
    return (
      <PrivateRoute 
        component={() => <QuestionPage key={`${roomId}-${questionNumber}`} />} 
      />
    );
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Discovery />} /> {/* Redirect to login by default */}
          <Route path="/resetpassword" element={<ForgotPassword />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/dashboard" element={<PrivateRoute component={DashBoard} />} />
          {/* <Route path="/room/:id" element={<Room />} /> */}
          <Route path="/me" element={<PrivateRoute component={AccountPage} />} />
          <Route path="/voucher" element={<PrivateRoute component={CouponCard} />} />
          <Route path="/generator/:userprofile" element={<PrivateRoute component={UserProfileFormCreator} />} />
          <Route path="/modify/:userprofile" element={<PrivateRoute component={UserProfileFormModify} />} />
          <Route path="/profile/:userprofile" element={<UserProfileCard />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path='/line' element={<LineCallback />} />
          {/*Admin*/}
          <Route path="/admin/dashboard" element={<PrivateRouteAdmin component={Panel} />} />
          <Route path='/admin/room-manager' element={<PrivateRouteAdmin component={GameRoomManager} />} />
          <Route path='/admin/user-manager' element={<PrivateRouteAdmin component={UserManager} />} />
          <Route path='/admin/profile' element={<PrivateRouteAdmin component={ProfileForm} />} />
          <Route path='/admin/report-manager' element={<PrivateRouteAdmin component={ReportManager} />} />
          {/*404 Not Found*/}
          <Route path="*" element={<NotFound />} />
          <Route path="/quiz/room/:roomId" element={<QuizRoom />} />
          <Route path="/quiz/room/:roomId/question/:questionNumber" element={<PrivateQuestionPageWrapper />} />
          {/* <Route path="/quiz/room/:roomId/results" element={<QuizResults />} /> */}
          
          <Route path="/create-room" element={<RoomSetup />} />
          <Route path="/test/:testId" element={<TestRoom />} />


        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;