odoo.define('web_preventautosave.basiccontroller', function (require) {
"use strict";

/**
 * This module prevent auto-save feature.
 */

    var core = require('web.core');
    var _t = core._t;

    var BasicController = require('web.BasicController');
    var Dialog = require('web.Dialog');

    BasicController.include({

        _urgentSave(recordID) {
            this.model.executeDirectly(() => {
                this.renderer.commitChanges(recordID);
                for (const key in this.pendingChanges) {
                    const { changes, dataPointID, event } = this.pendingChanges[key];
                    const options = {
                        context: event.data.context,
                        viewType: event.data.viewType,
                        notifyChange: false,
                    };
                    this.model.notifyChanges(dataPointID, changes, options);
                    this._confirmChange(dataPointID, Object.keys(changes), event);
                }
                if (this.isDirty()) {
                    console.log('Preventing auto save when page reloads.');
                    // this._saveRecord(recordID, { reload: false, stayInEdit: true });
                }
            });
        },

        saveChanges: async function (recordId) {
            // waits for _applyChanges to finish
            console.log('saveChanges');
            await this.mutex.getUnlockedDef();

            recordId = recordId || this.handle;
            // show confirmation message instead of auto-saving
            if (this.isDirty(recordId)) {
                var self = this;
                var def = new Promise(function (resolve, reject) {
                    var message = _t("The record has been modified, your changes will be discarded. Do you want to proceed?");
                    var dialog = Dialog.confirm(self, message, {
                        title: _t("Warning"),
                        confirm_callback: resolve.bind(self, true),
                        cancel_callback: reject,
                    });
                    dialog.on('closed', self, reject);
                });
                return def;
            }
        },
    })
});



