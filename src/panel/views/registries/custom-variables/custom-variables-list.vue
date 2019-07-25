<template>
  <div class="container-fluid" ref="window">
    <div class="row">
      <div class="col-12">
        <span class="title text-default mb-2">
          {{ translate('menu.registry') }}
          <small><i class="fas fa-angle-right"></i></small>
          {{ translate('menu.custom-variables') }}
        </span>
      </div>
    </div>

    <panel cards search @search="search = $event">
      <template v-slot:left>
        <button-with-icon class="btn-primary btn-reverse" icon="plus" href="#/registry/customVariables/edit">{{translate('dialog.title.add')}}</button-with-icon>
      </template>
    </panel>

    <loading v-if="!state.loaded /* State.DONE */" />
    <b-table v-else :fields="fields" :items="filteredVariables">
      <template slot="description" slot-scope="data">
        <small v-bind:class="{ 'text-muted': !data.value || data.value.length === 0 }">
          {{ data.value && data.value.length !== 0 ? data.value : translate('not-available') }}
        </small>
      </template>
      <template slot="type" slot-scope="data">
        <div style="font-size: 1.2rem;">
          {{ translate('registry.customvariables.types.' + data.value) }}
        </div>
      </template>
      <template slot="currentValue" slot-scope="data">
        <small v-bind:class="{ 'text-muted': !data.value || data.value.length === 0 }">
          {{ data.value && data.value.length !== 0 ? data.value : translate('not-available') }}
        </small>
      </template>
      <template slot="additional-info" slot-scope="data">
        <span v-if="data.item.type === 'eval'">
          <strong>{{ translate('registry.customvariables.run-script') }}:</strong>
          <template v-if="data.item.runEveryTypeValue > 0">
            {{ data.item.runEvery / data.item.runEveryTypeValue }} {{ translate('registry.customvariables.runEvery.' + data.item.runEveryType) }}
          </template>
          <template v-else>
            {{ translate('registry.customvariables.runEvery.' + data.item.runEveryType) }}
          </template>
          <div>
            {{ translate('registry.customvariables.last-run') }} <strong>{{ data.item.runAt ? new Date(data.item.runAt).toLocaleString() : translate('commons.never') }}</strong>
          </div>
        </span>
        <span v-if="data.item.type === 'options'">
          <strong>{{ translate('registry.customvariables.usableOptions.name') }}:</strong>
          {{ data.item.usableOptions }}
        </span>
        <div v-if="data.item.readOnly">
          <strong>{{ translate('registry.customvariables.isReadOnly') | capitalize }}</strong>
        </div>

        <div>
          <strong>{{ translate('registry.customvariables.response.name') }}:</strong>
          <span v-if="data.item.responseType === 0">{{ translate('registry.customvariables.response.default') }}</span>
          <span v-if="data.item.responseType === 1">{{ translate('registry.customvariables.response.custom') }}</span>
          <span v-if="data.item.responseType === 2">{{ translate('registry.customvariables.response.command') }}</span>
          <i v-if="data.item.responseType === 1">{{ data.item.responseText }}</i>
        </div>
        <div>
          <strong> {{ translate('registry.customvariables.permissionToChange') }}:</strong>
          <span v-if="getPermissionName(data.item.permission)">{{ getPermissionName(data.item.permission) }}</span>
          <span v-else class="text-danger"><i class="fas fa-exclamation-triangle"></i> Permission not found</span>
        </div>
      </template>
      <template slot="buttons" slot-scope="data">
        <a v-bind:href="'#/registry/customVariables/edit/' + data.item._id" class="btn btn-primary btn-block"><fa icon="edit"/> {{ translate('dialog.buttons.edit') }}</a>
        <button v-if="data.item.type === 'eval'" v-on:click="debouncedRunScript(data.item._id)" class="btn btn-secondary btn-block"><fa icon="cog"/> {{ translate('registry.customvariables.run-script') }}</button>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { debounce, orderBy } from 'lodash';

@Component({
  components: {
    'loading': () => import('../../../components/loading.vue'),
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
})
export default class customVariablesList extends Vue {
  psocket: SocketIOClient.Socket = io('/core/permissions', { query: 'token=' + this.token });
  socket: SocketIOClient.Socket =  io('/registry/customVariables', { query: "token=" + this.token });

  fields = [
    { key: 'variableName', label: '$_', sortable: true },
    { key: 'description', label: this.translate('registry.customvariables.description.name') },
    { key: 'type', sortable: true, label: this.translate('registry.customvariables.type.name') },
    { key: 'currentValue', label: this.translate('registry.customvariables.currentValue.name') },
    // virtual attributes
    { key: 'additional-info', label: this.translate('registry.customvariables.additional-info') },
    { key: 'buttons', label: '' },
  ];

  variables: {_id: string;currentValue: string;runAt: string;variableName: string}[] = [];
  permissions: {id: string; name: string;}[] = [];
  debouncedRunScript: ((id: any) => void) | null = null;
  search: string = '';

  state: { loaded: boolean; } = { loaded: false }

  get filteredVariables() {
    if (this.search.trim().length === 0) {
      return this.variables;
    } else {
      return this.variables.filter(variable => {
        return variable.variableName.toLowerCase().includes(this.search.toLowerCase());
      });
    }
  }

  created() {
    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    // In this case, we want to limit how often we access
    // yesno.wtf/api, waiting until the user has completely
    // finished typing before making the ajax request. To learn
    // more about the _.debounce function (and its cousin
    // _.throttle), visit: https://lodash.com/docs#debounce
    this.debouncedRunScript = debounce(this.runScript, 1000)

    this.psocket.emit('find', {}, (err, data) => {
      if (err) return console.error(err)
      this.permissions = orderBy(data, 'order', 'asc')
    })
  }

  mounted() {
    this.state.loaded = false;
    this.socket.emit('list.variables', (err, data) => {
      this.variables = data;
      this.state.loaded = true;
    })
  }

  getPermissionName(id) {
    if (!id) return null
    const permission = this.permissions.find((o) => {
      return o.id === id
    })
    if (typeof permission !== 'undefined') {
      if (permission.name.trim() === '') {
        return permission.id
      } else {
        return permission.name
      }
    } else {
      return null
    }
  }

  runScript(id) {
    this.socket.emit('run.script', id, (err, item) => {
      // update variable data
      let variable = this.variables.filter((o) => o._id === id)[0]
      variable.currentValue = item.currentValue
      variable.runAt = item.runAt
    })
  }
}
</script>