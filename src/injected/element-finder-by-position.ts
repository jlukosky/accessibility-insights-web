// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import * as Q from 'q';

import { HTMLElementUtils } from '../common/html-element-utils';
import { ClientUtils, IBoundRectAccessor } from './client-utils';
import { FrameCommunicator } from './frameCommunicators/frame-communicator';
import { FrameMessageResponseCallback } from './frameCommunicators/window-message-handler';
import { IErrorMessageContent } from './frameCommunicators/window-message-marshaller';
import { ScannerUtils } from './scanner-utils';

export interface ElementFinderByPositionMessage {
    x: number;
    y: number;
}

export class ElementFinderByPosition {
    public static readonly findElementByPositionCommand = 'insights.findElementByPositionCommand';
    private scannerUtils: ScannerUtils;
    private frameCommunicator: FrameCommunicator;
    private clientUtils: ClientUtils;
    private q: typeof Q;
    private dom: Document;

    constructor(frameCommunicator: FrameCommunicator, clientUtils: ClientUtils, scannerUtils: ScannerUtils, q: typeof Q, dom: Document) {
        this.frameCommunicator = frameCommunicator;
        this.scannerUtils = scannerUtils;
        this.clientUtils = clientUtils;
        this.q = q;
        this.dom = dom;
    }

    public initialize(): void {
        this.frameCommunicator.subscribe(ElementFinderByPosition.findElementByPositionCommand, this.onfindElementByPosition);
    }

    @autobind
    protected onfindElementByPosition(
        message: ElementFinderByPositionMessage,
        error: IErrorMessageContent,
        sourceWin: Window,
        responder?: FrameMessageResponseCallback,
    ): void {
        this.processRequest(message).then(
            result => {
                responder(result, null, sourceWin);
            },
            err => {
                responder(null, err, sourceWin);
            },
        );
    }

    public processRequest(message: ElementFinderByPositionMessage): Q.IPromise<string[]> {
        let path = [];
        const deferred = this.q.defer<string[]>();
        const element = this.getElementByPosition(message);

        if (element == null) {
            deferred.resolve(path);
            return deferred.promise;
        }

        path.push(this.scannerUtils.getUniqueSelector(element));

        if (element.tagName.toLocaleLowerCase() !== 'iframe') {
            deferred.resolve(path);
            return deferred.promise;
        }

        const elementRect = this.clientUtils.getOffset(element as IBoundRectAccessor);

        this.frameCommunicator
            .sendMessage<ElementFinderByPositionMessage, string[]>({
                command: ElementFinderByPosition.findElementByPositionCommand,
                frame: element as HTMLIFrameElement,
                message: {
                    x: message.x + window.scrollX - elementRect.left,
                    y: message.y + window.scrollY - elementRect.top,
                } as ElementFinderByPositionMessage,
            })
            .then(
                result => {
                    path = path.concat(result);

                    deferred.resolve(path);
                },
                err => {
                    deferred.reject(null);
                },
            );

        return deferred.promise;
    }

    private getElementByPosition(message: ElementFinderByPositionMessage): HTMLElement {
        const elements = this.dom.elementsFromPoint(message.x, message.y) as HTMLElement[];

        for (let pos = 0; pos < elements.length; pos++) {
            if (elements[pos].id === 'insights-shadow-host') {
                continue;
            }
            return elements[pos];
        }
    }
}
