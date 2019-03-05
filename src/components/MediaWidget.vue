<template>

    <div class="file" :class="{ selected: mmc.isSelected(file) }">

        <div class="file-preview">

            <template v-if="file.thumb">
                <img v-bind:src="file.thumb" class="thumb">
            </template>

            <template v-else-if="file.type=='dir'">
                <div class="icon">
                    <i class="fa fa-fw fa-folder"></i>
                </div>
            </template>

            <template v-else>
                <div class="icon">
                    <i v-bind:class="mmc.faIconClass(file)"></i>
                </div>
            </template>

        </div>

        <div class="file-title">{{ file.basename }}</div>

        <div class="file-uploaded-at">
            {{ formatDate(file.uploaded_at) }}
        </div>

    </div>

</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

export default {
    props: [ 'file' ],
    computed: {
        mmc() {
            return this.$parent.$parent;
        }
    },
    methods: {
        formatDate(dateString) {
            return moment(dateString).format('DD.MM.YYYY HH:mm'); 
        }
    }
};
</script>

<style lang="scss">
$fileWidth: 70px;
$filePreviewHeight: 60px;
$fileTitleHeight: 20px;
$fileHeight: $filePreviewHeight + $fileTitleHeight;
$filePreviewPadding: 4px;
$fileBorderWidth: 2px;
$filePreviewDiff: 2*($fileBorderWidth+$filePreviewPadding);
$filePreviewIconHeight: $filePreviewHeight - $filePreviewDiff;
$fileBorderColor: #eee;
$fileBorderColorH: #333;

$fileListItemHeight: 40px;

.file {
    cursor: pointer;
}

.icons-view {
    .file {
        display: flex;
        float: left;
        width: $fileWidth;
        height: $fileHeight;
        flex-direction: column;
        border-width: 0px;
        background-color: $fileBorderColor;
        transition: background-color 0.4s;
    }
    .selected {
        background-color: $fileBorderColorH;
        .file-title {
            color: white;
        }
    }
    .file-preview {
        height: $filePreviewHeight - $fileBorderWidth;
        margin: $fileBorderWidth $fileBorderWidth 0 $fileBorderWidth;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .thumb {
            padding: 4px;
            width: 100%;
        }
        .icon {
            margin-top: $fileBorderWidth;
            font-size: $filePreviewHeight/2;
        }
    }
    .file-title {
        height: $fileTitleHeight;
        width: $fileWidth - 8px;
        margin-left: 4px; 
        overflow: hidden;

        background-color: transparent;
        color: #000;
        transition: color 0.4s;

        line-height: $fileTitleHeight;
        font-size: $fileTitleHeight/2;
    }
    .file-uploaded-at {
        display: none;
    }
}

.list-view {
    .file {
        height: $fileListItemHeight;
        border: $fileBorderWidth solid $fileBorderColor;
        transition: border-color 0.4s;
        display: block;
    }
    .file::after {
        clear: both;
    }
    .selected {
        border-color: $fileBorderColorH;
    }
    .file-preview {
        width: $fileListItemHeight;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        float: left;

        .thumb {
            padding: 4px;
            width: 100%;
        }
        .icon {
            margin-top: $fileBorderWidth*2;
            font-size: $fileListItemHeight/2;
        }
    }
    .file-title {
        padding-left: 2px;
        float: left;
        height: $fileListItemHeight;
        line-height: $fileListItemHeight; 
    }
    .file-uploaded-at {
        float: right;
        height: $fileListItemHeight;
        line-height: $fileListItemHeight; 
        padding-right: 5px;
    }
}

</style>
