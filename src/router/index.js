import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";

// Lazy-loaded route components for better performance
const Dashboard = () => import("@/views/Dashboard.vue");
const Login = () => import("@/views/Login.vue");
const ProjectList = () => import("@/views/projects/ProjectList.vue");
const ProjectDetails = () => import("@/views/projects/ProjectDetails.vue");
const ProjectCreate = () => import("@/views/projects/ProjectCreate.vue");
const ProjectEdit = () => import("@/views/projects/ProjectEdit.vue");
const MilestoneList = () => import("@/views/milestones/MilestoneList.vue");
const MilestoneDetails = () =>
  import("@/views/milestones/MilestoneDetails.vue");
const ProgressTracker = () => import("@/views/progress/ProgressTracker.vue");
const Statistics = () => import("@/views/statistics/Statistics.vue");
const Settings = () => import("@/views/Settings.vue");
const OrganizationList = () => import("@/views/settings/OrganizationList.vue");
const UserList = () => import("@/views/settings/UserList.vue");
const NotFound = () => import("@/views/NotFound.vue");

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects",
    name: "Projects",
    component: ProjectList,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/create",
    name: "ProjectCreate",
    component: ProjectCreate,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/:id",
    name: "ProjectDetails",
    component: ProjectDetails,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/projects/:id/edit",
    name: "ProjectEdit",
    component: ProjectEdit,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/milestones",
    name: "Milestones",
    component: MilestoneList,
    meta: { requiresAuth: true },
  },
  {
    path: "/milestones/:id",
    name: "MilestoneDetails",
    component: MilestoneDetails,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/progress",
    name: "Progress",
    component: ProgressTracker,
    meta: { requiresAuth: true },
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: Statistics,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings/organizations",
    name: "Organizations",
    component: OrganizationList,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings/users",
    name: "Users",
    component: UserList,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isLoggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router;
