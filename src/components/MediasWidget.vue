<template>

    <div class="medias-widget clearfix">

        <template v-if="error">

            <div class="alert alert-warning animated fadeIn">
                {{ error }}
                <p><button v-on:click.prevent="refresh()" class="btn btn-primary"><i class="fa fa-fw fa-refresh"></i> Click here to retry</button></p>
            </div>

        </template>
        <template v-else>

            <!--<div v-if="!loading && files.length==0" class="alert alert-info animated fadeIn">-->
            <!--    This folder is empty.-->
            <!--</div>-->

            <div class="medias">
                <template v-if="loading">

                    <div class="file animated fadeIn">
                        <div class="file-preview">
                            <div class="icon">
                                <i class="fa fa-fw fa-spin fa-refresh"></i>
                            </div>
                        </div>
                    </div>

                </template>
                <template v-else>
                    <div class="editor-toolbar">
                        <a
                            class="fa fa-th"
                            :class="{active:!listViewActive}"
                            @click="listViewActive=false"
                        ></a>
                        <a
                            class="fa fa-bars"
                            :class="{active:listViewActive}"
                            @click="listViewActive=true"
                        ></a>
                        <input v-model="filterPattern" placeholder="Поиск"/>
                        <span>Сортировка:</span>
                        <select v-model="sorting">
                            <option value="freshFirst">Новые сверху</option>
                            <option value="oldFirst">Старые сверху</option>
                            <option value="aToZ">A -> Z</option>
                            <option value="zToA">Z -> A</option>
                        </select>
                    </div> 

                    <div class="files clearfix" :class="listViewActive ? 'list-view' : 'icons-view'">
                        <div v-if="relPath" v-on:click="browse(pathUp)" class="file animated fadeIn">
                            <div class="file-preview">
                                <div class="icon" style="margin-right: 5px">
                                    <i class="fa fa-fw fa-backward"></i>
                                </div>
                            </div>
                        </div>

                        <media-widget
                            v-for="(file,index) in filteredFiles"
                            v-on:click.native="onMediaClick(file)"
                            v-on:contextmenu.native.prevent="onContextMenu(file, $event)"
                            v-bind:file="file"
                            v-bind:key="`${index}-${file.path}`"
                            class="animated fadeIn"
                        ></media-widget>
                    </div>

                </template>
            </div>

            <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
                <div v-if="showContextMenu" class="context-menu" v-bind:style="contextMenuStyle">
                    <ul v-if="contextMenuFile.type=='dir'">
                        <li><a v-on:click.prevent="onMediaClick(contextMenuFile)" href="#"><i class="fa fa-fw fa-folder-open"></i> Open</a></li>
                        <li><a v-on:click.prevent="mmc.toggleDetailsOn(contextMenuFile)" href="#"><i class="fa fa-fw fa-info-circle"></i> Details</a></li>
                    </ul>
                    <ul v-else>
                        <li v-if="mmc.isSelected(contextMenuFile)"><a v-on:click.prevent="mmc.unselectFile(contextMenuFile)" href="#"><i class="fa fa-fw fa-times"></i> Unselect</a></li>
                        <li v-else><a v-on:click.prevent="mmc.selectFile(contextMenuFile)" href="#"><i class="fa fa-fw fa-check"></i> Select</a></li>
                        <li><a v-on:click.prevent="mmc.toggleDetailsOn(contextMenuFile)" href="#"><i class="fa fa-fw fa-info-circle"></i> Details</a></li>
                        <li v-if="api.downloadUrl(contextMenuFile)" ><a v-bind:href="api.downloadUrl(contextMenuFile)"><i class="fa fa-fw fa-download"></i> Download</a></li>
                    </ul>
                </div>
            </transition>

        </template>

    </div>

</template>

<script>
/* global $ */
import { mapState } from 'vuex';
import MediaWidget from './MediaWidget.vue';

export default {
    components: { MediaWidget },
    data() {
        return {
            files: [],
            loading: false,
            error: false,
            contextMenuFile: {},
            contextMenuX: 0,
            contextMenuY: 0,
            showContextMenu: false,
            listViewActive: false,
            filterPattern: '',
            sorting: 'freshFirst'
        };
    },
    props: ['path'],
    computed: {
        ...mapState({
            basePath: state => state.options.basePath
        }),
        mmc() {
            return this.$parent;
        },
        api () {
            return this.mmc.api;
        },
        relPath() {
            return this.path.replace(this.basePath, '');
        },
        pathUp() {
            let path = '', index = this.relPath.lastIndexOf('/');
            if (index>-1) {
                path = this.relPath.slice(0, index);
            }
            return this.basePath + path;
        },
        contextMenuStyle() {
            return 'left: '+this.contextMenuX+'px; top:'+this.contextMenuY+'px;';
        },
        filteredFiles() {
            function split(arr, prop, left, right) {
                arr.forEach(val => {
                    if(prop(val)) {
                        left.push(val);
                    } else {
                        right.push(val);
                    }
                });
            }

            const re = RegExp(this.filterPattern, 'i');
            const filteredDirsAndFiles = this.files.filter(
                file => file.basename.match(re)); 

            const filteredDirs  = [], filteredFiles = [];

            split(filteredDirsAndFiles, file => file.type === 'dir',
                filteredDirs, filteredFiles);
           
            switch(this.sorting) {
                case 'aToZ':
                    return filteredDirs.concat(filteredFiles);
                case 'zToA':
                    return filteredDirs.concat(filteredFiles.reverse());
                case 'freshFirst':
                case 'oldFirst':
                    const withDate = [], withoutDate = [];

                    split(filteredFiles, file => file.uploaded_at,
                        withDate, withoutDate);

                    withDate.forEach(file => {
                        file.uploadedAt = new Date(file.uploaded_at);
                    });                    
                   
                    const sortedByDate = this.sorting === 'freshFirst' ?
                        withDate.sort((a, b) => b.uploadedAt - a.uploadedAt) :
                        withDate.sort((a, b) => a.uploadedAt - b.uploadedAt) ; 

                    return filteredDirs.concat(withoutDate).concat(sortedByDate);
            }
        }
    },
    watch: {
        path: function() {
            this.refresh();
        }
    },
    mounted() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.loading = true;
            this.error = false;
            
            this.api.list(this.path)
                .then(response => {
                    if (Array.isArray(response.data)) {
                        response.data.sort((a, b) => {
                            let as = a.type +'/'+ a.basename,
                                bs = b.type +'/'+ b.basename;
                            return as.localeCompare(bs)
                        });
                        this.files = response.data;
                    }
                    this.loading = false;
                }, error => {
                    // TODO
                    this.error = error.toString();
                    this.files = [];
                    this.loading = false;
                });
        },
        browse(path) {
            this.mmc.path = path;
        },

        onMediaClick(file) {
            if (file.type=='dir') {
                this.browse(file.path);
            } else {
                let mmc = this.mmc;
                if (mmc.isSelected(file)) {
                    mmc.unselectFile(file);
                } else {
                    mmc.selectFile(file);
                }
            }
        },

        onDocumentClick(e) {
            this.toggleContextMenuOff();
        },
        onContextMenu(file, e) {
            let clientRect = this.mmc.$el.getBoundingClientRect();
            this.contextMenuFile = file;
            this.contextMenuX = e.clientX - clientRect.left;
            this.contextMenuY = e.clientY - clientRect.top;
            this.toggleContextMenuOn();
        },
        toggleContextMenuOn() {
            this.showContextMenu = true;
            document.addEventListener('click', this.onDocumentClick);
        },
        toggleContextMenuOff() {
            this.contextMenuFile = {};
            this.contextMenuX = 0;
            this.contextMenuY = 0;
            this.showContextMenu = false;
            document.removeEventListener('click', this.onDocumentClick);
        }
    }
};
</script>

<style lang="scss">
$filesMargin: 5px;
$toolbarHorizontalMargins:5px;  
$toolbarVerticalPaddings: 10px;

.medias {
    margin: (-$filesMargin) (-$filesMargin) 15px (-$filesMargin);

    .editor-toolbar {
        display: flex;
        align-items: center;
        padding-top: $toolbarVerticalPaddings;
        padding-bottom: $toolbarVerticalPaddings;
        margin: 20px $toolbarHorizontalMargins 0 $toolbarHorizontalMargins;
        a {
            margin-right: 5px;
        }
        input {
            height: 30px;
            padding-left: 5px;
            margin-right: 10px;
        }
        select {
            height: 30px;
            margin-left: 3px;
            padding-left: 3px;
        }
    }
    .files {
        border: 1px solid #ddd;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        margin-left: $toolbarHorizontalMargins;
        margin-right: $toolbarHorizontalMargins;
        padding: 5px;
    }
    .file {
        margin: $filesMargin;
    }
}

.context-menu {
    position: absolute;
    background-color: #fff;
    box-shadow: 0 1px 5px rgba(0,0,0,0.5);
    z-index: 100;

    ul {
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
    }

    li {
        display: block;
        a {
            display: block;
            padding: 6px 15px;
            font-weight: normal;
            color: #333;
            text-decoration: none;
            white-space: nowrap;
            &:hover {
                background-color: #eee;
            }
        }
    }
}

</style>
