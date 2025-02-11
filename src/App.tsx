// src/App.js or App.tsx
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// ADMIN ROUTES
import VideoUpload from "./screens/Admin/videos/upload/upload";
import AdminLogin from "./screens/Admin/login/login";
import AdminLayout from "./screens/Admin/layout";
import Videos from "./screens/Admin/videos/videos";
import VideoDetailPage from "./screens/Admin/videos/details/details";
import EditVideoDetailsPage from "./screens/Admin/videos/edit/edit";
import Facilities from "./screens/Admin/facilities/facilities";
import AddFacility from "./screens/Admin/facilities/add/add.facilities";
import FacilityDetailPage from "./screens/Admin/facilities/details/facilities.details";
import EditFacility from "./screens/Admin/facilities/edit/edit.facilities";
import Managers from "./screens/Admin/managers/managers";
import AddManager from "./screens/Admin/managers/add/add.manager";
import ManagerDetailPage from "./screens/Admin/managers/details/manager.details";
import EditManagerDetails from "./screens/Admin/managers/edit/edit.manager";

// CLIENT PANEL ROUTES
import ClientLogin from "./screens/Client/login/login.client";
import ClientLayout from "./screens/Client/layout";
import Users from "./screens/Client/users/users";
import AddUser from "./screens/Client/users/add/useradd";
import UserDetailPage from "./screens/Client/users/details/users.details";
import EditUserDetails from "./screens/Client/users/edit/user.edit";
import Trainers from "./screens/Client/trainers/trainer";
import AddTrainer from "./screens/Client/trainers/add/trainer.add";
import TrainerDetailPage from "./screens/Client/trainers/details/trainer.details";
import EditTrainerDetails from "./screens/Client/trainers/edit/trainer.edit";
import ChooseUsers from "./screens/Client/training/chooseusers/users";
import ChooseVideos from "./screens/Client/training/choosevideo/choosevideo";
import WatchVideo from "./screens/Client/training/watchvideo/watchvideo";
import CreateReport from "./screens/Client/training/report/createreport";
import Report from "./screens/Client/traininghistory/report/report";
import ShowTrainingHistory from "./screens/Client/traininghistory/showhistory/history.training";
import NotFound from "./screens/components/NotFound";
import Companies from "./screens/Admin/companies/companies";
import AddCompany from "./screens/Admin/companies/add/add.companies";
import CompanyDetails from "./screens/Admin/companies/detail/company.deatil";
import EditCompany from "./screens/Admin/companies/edit/company.edit";
import PasswordResetLink from "./screens/Admin/forgotpassword/getpasswordlink";
import ResetPassword from "./screens/Admin/forgotpassword/resetpassword";
import ClientPasswordResetLink from "./screens/Client/forgotpassword/getpasswordlink";
import ClientResetPassword from "./screens/Client/forgotpassword/resetpassword";
import UserReport from "./screens/Client/traininghistory/user/report";
import CSVAddUser from "./screens/Client/users/add/csvadd";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ClientLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/reset-password-link"
          element={<PasswordResetLink />}
        />
        <Route path="/admin/reset-password/:id" element={<ResetPassword />} />
        <Route path="/clients/login" element={<ClientLogin />} />
        <Route
          path="/clients/reset-password-link"
          element={<ClientPasswordResetLink />}
        />
        <Route
          path="/clients/reset-password/:id"
          element={<ClientResetPassword />}
        />
        {/* Admin routes with layout */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                {/* Default route for /admin */}
                <Route path="/" element={<Navigate to="/admin/videos" />} />

                {/* Specific admin routes */}
                {/* <Route path="/" element={<Sidebar />} /> */}
                <Route path="videos" element={<Videos />} />
                <Route path="videos/upload" element={<VideoUpload />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/new" element={<AddCompany />} />
                <Route path="companies/:id" element={<CompanyDetails />} />
                <Route path="companies/:id/edit" element={<EditCompany />} />
                <Route path="facilities" element={<Facilities />} />
                <Route
                  path="companies/:id/facilities/new"
                  element={<AddFacility />}
                />
                <Route
                  path="companies/:id/facilities/:id"
                  element={<FacilityDetailPage />}
                />
                <Route
                  path="companies/:id/facilities/:id/edit"
                  element={<EditFacility />}
                />
                <Route
                  path="companies/:id/facilities/:id/managers"
                  element={<Managers />}
                />
                <Route path="videos/:id" element={<VideoDetailPage />} />
                <Route
                  path="videos/:id/edit"
                  element={<EditVideoDetailsPage />}
                />
                <Route
                  path="companies/:id/facilities/:id/managers/new"
                  element={<AddManager />}
                />
                <Route
                  path="companies/:id/facilities/:id/managers/:id"
                  element={<ManagerDetailPage />}
                />
                <Route
                  path="companies/:id/facilities/:id/managers/:id/edit"
                  element={<EditManagerDetails />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          }
        />
        <Route
          path="/clients/*"
          element={
            <ClientLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/clients/users" />} />

                <Route path="users" element={<Users />} />
                <Route path="users/new" element={<AddUser />} />
                <Route path="users/new-csv" element={<CSVAddUser />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="users/:id/edit" element={<EditUserDetails />} />
                <Route path="trainers" element={<Trainers />} />
                <Route path="trainers/new" element={<AddTrainer />} />
                <Route path="trainers/:id" element={<TrainerDetailPage />} />
                <Route
                  path="trainers/:id/edit"
                  element={<EditTrainerDetails />}
                />
                <Route path="/training_tracks" element={<Report />} />
                <Route
                  path="/training_tracks/userReport/:id"
                  element={<UserReport />}
                />
                <Route
                  path="/training_tracks/history"
                  element={<ShowTrainingHistory />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ClientLayout>
          }
        />
        <Route
          path="/clients/training_tracks/new/participants"
          element={<ChooseUsers />}
        />
        <Route
          path="/clients/training_tracks/new/videos"
          element={<ChooseVideos />}
        />
        <Route path="/clients/training_tracks/video" element={<WatchVideo />} />
        <Route
          path="/clients/training_tracks/form"
          element={<CreateReport />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
