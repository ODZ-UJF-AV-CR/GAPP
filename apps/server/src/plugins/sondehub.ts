import { Uploader } from '@gapp/sondehub';
import type { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins.ts';

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
        logLevel: options.dev ? 'debug' : 'info',
        logger: {
            debug: (message: string) => fastify.log.debug(message),
            info: (message: string) => fastify.log.info(message),
            error: (message: string) => fastify.log.error(message),
        },
    });

    fastify.decorate('sondehub', uploader);

    fastify.addHook('onClose', async () => {
        fastify.log.info('Deinitializing sondehub uploader...');
        await uploader.deinit();
        fastify.log.info('Sondehub uploader deinitialized');
    });
};

export default fp(sondehubPlugin, { name: Plugins.SONDEHUB });
