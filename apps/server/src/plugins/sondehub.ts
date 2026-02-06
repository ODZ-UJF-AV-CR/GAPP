import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { Uploader } from '@gapp/sondehub';

interface SondehubPluginOptions extends FastifyPluginOptions {
    dev: boolean;
}

declare module 'fastify' {
    interface FastifyInstance {
        sondehub: Uploader;
    }
}

const sondehubPlugin: FastifyPluginAsync<SondehubPluginOptions> = async (fastify, options) => {
    const uploader = new Uploader({
        uploader_callsign: 'gapp-default',
        dev: options.dev,
        software_name: 'gapp-server',
        software_version: '0.0.1',
    });

    fastify.decorate('sondehub', uploader);

    fastify.addHook('onClose', async () => {
        fastify.log.info('Deinitializing sondehub uploader...');
        await uploader.deinit();
        fastify.log.info('Sondehub uploader deinitialized');
    });
};

export default fp(sondehubPlugin, { name: Plugins.SONDEHUB });
