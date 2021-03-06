<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <span class="title text-default mb-2">
          {{ translate('menu.manage') }}
          <small><fa icon="angle-right"/></small>
          {{ translate('menu.alias') }}
        </span>
      </b-col>
      <b-col v-if="!$systems.find(o => o.name === 'alias').enabled" style=" text-align: right;">
        <b-alert show variant="danger" style="padding: .5rem; margin: 0; display: inline-block;">
          <fa icon="exclamation-circle" fixed-width/> {{ translate('this-system-is-disabled') }}
        </b-alert>
      </b-col>
    </b-row>

    <panel search @search="search = $event">
      <template v-slot:left>
        <button-with-icon class="btn-primary btn-reverse" icon="plus" href="#/manage/alias/edit">{{translate('systems.alias.new')}}</button-with-icon>
      </template>
    </panel>

    <loading v-if="state.loadingAls !== $state.success || state.loadingPrm !== $state.success"/>
    <b-alert show variant="danger" v-else-if="state.loadingAls === $state.success && state.loadingPrm === $state.success && fItems.length === 0 && search.length > 0">
      <fa icon="search"/> <span v-html="translate('systems.alias.emptyAfterSearch').replace('$search', search)"/>
    </b-alert>
    <b-alert show v-else-if="state.loadingAls === $state.success && state.loadingPrm === $state.success && items.length === 0">
      {{translate('systems.alias.empty')}}
    </b-alert>
    <b-table v-else striped small hover :items="fItems" :fields="fields" @row-clicked="linkTo($event)" >
      <template v-slot:cell(buttons)="data">
        <div class="float-right" style="width: max-content !important;">
          <button-with-icon :class="[ data.item.enabled ? 'btn-success' : 'btn-danger' ]" class="btn-only-icon btn-reverse" icon="power-off" @click="data.item.enabled = !data.item.enabled; update(data.item)">
            {{ translate('dialog.buttons.' + (data.item.enabled? 'enabled' : 'disabled')) }}
          </button-with-icon>
          <button-with-icon class="btn-only-icon btn-primary btn-reverse" icon="edit" v-bind:href="'#/manage/alias/edit/' + data.item.id">
            {{ translate('dialog.buttons.edit') }}
          </button-with-icon>
          <b-dropdown no-caret class="alias-table-btn">
            <template v-slot:button-content><fa icon="key" fixed-width/></template>
            <b-dropdown-item
              v-for="permission of permissions"
              :key="data.item.id + permission.id"
              @click="updatePermission(data.item.id, permission.id)">
              {{ permission.name }}
            </b-dropdown-item>
          </b-dropdown>
          <button-with-icon class="btn-only-icon btn-dark btn-reverse" :icon="['fas', data.item.visible ? 'eye' : 'eye-slash']" @click="data.item.visible = !data.item.visible; update(data.item)">
            {{ translate('dialog.buttons.edit') }}
          </button-with-icon>
          <hold-button @trigger="remove(data.item.id)" icon="trash" class="btn-danger btn-reverse btn-only-icon">
            <template slot="title">{{translate('dialog.buttons.delete')}}</template>
            <template slot="onHoldTitle">{{translate('dialog.buttons.hold-to-delete')}}</template>
          </hold-button>
        </div>
      </template>
    </b-table>
  </b-container>
</template>

<script lang="ts">
import { getSocket } from 'src/panel/helpers/socket';

import { AliasInterface } from 'src/bot/database/entity/alias';
import { PermissionsInterface } from 'src/bot/database/entity/permissions';

import { Vue, Component/*, Watch */ } from 'vue-property-decorator';
import { orderBy, isNil } from 'lodash-es';
import { escape } from 'xregexp';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faKey } from '@fortawesome/free-solid-svg-icons';
library.add(faKey);

@Component({
  components: {
    loading: () => import('../../../components/loading.vue'),
    'hold-button': () => import('../../../components/holdButton.vue'),
  },
})
export default class aliasList extends Vue {
  socket = getSocket('/systems/alias');
  psocket = getSocket('/core/permissions')

  items: AliasInterface[] = [];
  permissions: PermissionsInterface[] = [];
  search: string = '';
  state: {
    loadingAls: number;
    loadingPrm: number;
  } = {
    loadingAls: this.$state.progress,
    loadingPrm: this.$state.progress,
  }

  fields = [
    { key: 'alias', label: this.translate('alias'), sortable: true },
    { key: 'command', label: this.translate('command'), sortable: true },
    { key: 'permission',
      label: this.translate('permission'),
      sortable: true,
      formatter: (value, key, item) => {
        return this.getPermissionName(value);
      },
      sortByFormatted: true, },
    { key: 'buttons', label: '' },
  ];

  get fItems() {
    if (this.search.length === 0) return this.items
    return this.items.filter((o) => {
      const isSearchInAlias = !isNil(o.alias.match(new RegExp(escape(this.search), 'ig')))
      const isSearchInCommand = !isNil(o.command.match(new RegExp(escape(this.search), 'ig')))
      return isSearchInAlias || isSearchInCommand
    })
  }

  created() {
    this.state.loadingAls = this.$state.progress;
    this.state.loadingPrm = this.$state.progress;
    this.psocket.emit('permissions', (data) => {
      this.permissions = data;
      this.state.loadingPrm = this.$state.success;
    })
    this.socket.emit('alias:getAll', (err, items) => {
      this.items = orderBy(items, 'alias', 'asc');
      this.state.loadingAls = this.$state.success;
    })
  }

  getPermissionName (id) {
    if (!id) return 'Disabled'
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

  updatePermission (id, permission) {
    let item = this.items.filter((o) => o.id === id)[0]
    item.permission = permission
    this.socket.emit('setById', item.id, item, () => {})
    this.$forceUpdate();
  }

  linkTo(item) {
    console.debug('Clicked', item.id);
    this.$router.push({ name: 'aliasManagerEdit', params: { id: item.id } });
  }

  remove(id) {
   this.socket.emit('deleteById', id, () => {
      this.items = this.items.filter((o) => o.id !== id)
    })
  }

  update(item) {
    this.socket.emit('setById', item.id, item, () => {})
  }
}
</script>

<style>
.alias-table-btn button {
  padding: 6px !important;
}
</style>
