import { Router } from 'express';
import { body, header, param, validate } from '../middleware/validate';
import { recordServerStatus } from '../model/serverStatus';
import fs from 'fs-extra';
import path from 'path';

export const serverStatusRouter = Router();

const installScript = fs.readFileSync(
  path.resolve(process.cwd(), './scripts/install.sh')
);

serverStatusRouter.post(
  '/report',
  validate(
    header('x-tianji-report-version').isSemVer(),
    body('workspaceId').isString(),
    body('name').isString(),
    body('hostname').isString(),
    body('timeout').optional().isInt(),
    body('payload').isObject()
  ),
  async (req, res) => {
    const body = req.body;

    recordServerStatus(body);

    res.send('success');
  }
);

serverStatusRouter.get(
  '/:workspaceId/install.sh',
  validate(param('workspaceId').isString()),
  async (req, res) => {
    const { workspaceId } = req.params;
    const server = `${req.protocol}://${req.get('Host')}`;

    res
      .setHeader('Content-Type', 'text/plain')
      .send(
        String(installScript)
          .replace('{{DEFAULT_SERVER}}', server)
          .replace('{{DEFAULT_WORKSPACE}}', workspaceId)
      );
  }
);