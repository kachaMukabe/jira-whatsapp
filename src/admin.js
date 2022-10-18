import ForgeUI, {
  render,
  AdminPage,
  Fragment,
  Text,
  Form,
  Button,
  Select,
  TextField,
  Heading,
  ModalDialog,
  Option,
  useState,
  useEffect,
  Table,
  Head,
  Row,
  Cell,
} from '@forge/ui';

import { fetchProjects } from './jira';
import { storage, webTrigger } from '@forge/api';
import { obfuscate } from './utils';

const App = () => {
  const [projectData] = useState(() => fetchProjects());
  const [open, setOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [project, setProject] = useState(undefined);
  const [webtrigger] = useState(
    async () => await webTrigger.getUrl('jira-whatsapp-webtrigger-sync')
  );

  useEffect(async () => {
    const secret = await storage.getSecret('whatsapp-secretKey');
    const token = await storage.getSecret('whatsapp-accessToken');
    const projectId = await storage.getSecret('whatsapp-jira-project');
    setSecretKey(secret);
    setAccessToken(token);
    setProject(projectId);
  }, []);

  const onSettingsSubmit = async ({ secretKey, token }) => {
    await storage.setSecret('whatsapp-accessToken', token);
    await storage.setSecret('whatsapp-secretKey', secretKey);
    setSecretKey(secretKey);
    setAccessToken(token);
    setOpen(false);
  };

  const onProjectPicked = async ({ project }) => {
    console.log(project, 'hello world');
    setProject(project);
    await storage.setSecret('whatsapp-jira-project', project);
    setProjectOpen(false);
  };

  const renderProjectPicker = () => {
    return projectData.length !== 0 ? (
      <Form onSubmit={onProjectPicked}>
        <Select label="Choose project" name="project">
          {projectData.map((p) => (
            <Option
              label={p.name}
              value={p.id}
              defaultSelected={p.id === project}
            />
          ))}
        </Select>
      </Form>
    ) : (
      <Text content="No configurable projects available" />
    );
  };

  const renderSettingsForm = () => (
    <Form onSubmit={onSettingsSubmit}>
      <TextField name="secretKey" label="Secret Key" defaultValue={secretKey} />
      <TextField
        name="token"
        label="Whatsapp Token"
        defaultValue={accessToken}
      />
    </Form>
  );

  return (
    <AdminPage>
      <Fragment>
        <Heading>Whatsapp Settings</Heading>
        <Table>
          <Head>
            <Cell>
              <Text>Identifier</Text>
            </Cell>
            <Cell>
              <Text>Value</Text>
            </Cell>
            <Cell>
              <Text>Actions</Text>
            </Cell>
          </Head>
          <Row>
            <Cell>
              <Text>Secret Key</Text>
            </Cell>
            <Cell>
              <Text>{obfuscate(secretKey)}</Text>
            </Cell>
            <Cell>
              <Button text="Edit" onClick={() => setOpen(true)} />
            </Cell>
          </Row>
          <Row>
            <Cell>
              <Text>Access Token</Text>
            </Cell>
            <Cell>
              <Text>{obfuscate(accessToken)}</Text>
            </Cell>
            <Cell>
              <Button text="Edit" onClick={() => setOpen(true)} />
            </Cell>
          </Row>
          <Row>
            <Cell>
              <Text>Callback Url</Text>
            </Cell>
            <Cell>
              <Text>{webtrigger}</Text>
            </Cell>
          </Row>
          <Row>
            <Cell>
              <Text>Selected Project</Text>
            </Cell>
            <Cell>
              <Text>{project}</Text>
            </Cell>
            <Cell>
              <Button text="Choose" onClick={() => setProjectOpen(true)} />
            </Cell>
          </Row>
        </Table>
        {open && (
          <ModalDialog header="Edit settings" onClose={() => setOpen(false)}>
            {renderSettingsForm()}
          </ModalDialog>
        )}
        {projectOpen && (
          <ModalDialog
            header="Choose project"
            onClose={() => setProjectOpen(false)}
          >
            {renderProjectPicker()}
          </ModalDialog>
        )}
      </Fragment>
    </AdminPage>
  );
};

export const run = render(<App />);
