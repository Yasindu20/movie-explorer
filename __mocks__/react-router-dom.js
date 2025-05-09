const reactRouterDom = jest.createMockFromModule('react-router-dom');

// Mock the specific components and hooks you're using
reactRouterDom.BrowserRouter = ({ children }) => children;
reactRouterDom.Routes = ({ children }) => children;
reactRouterDom.Route = ({ element }) => element;
reactRouterDom.Navigate = () => null;
reactRouterDom.useNavigate = () => jest.fn();
reactRouterDom.useLocation = () => ({ pathname: '/' });
reactRouterDom.Link = ({ children }) => children;
reactRouterDom.useParams = () => ({ id: '123' });

// Export the mock
module.exports = reactRouterDom;