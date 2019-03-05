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

        <div class="file-uploaded-at">{{ file.uploaded_at }}</div>

    </div>

</template>

<script>
import { mapState } from 'vuex';

export default {
    props: [ 'file' ],
    computed: {
        mmc() {
            return this.$parent.$parent;
        }
    },
    methods: {
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

.file {
    display: flex;
    cursor: pointer;
}

.icons-view {
    .file {
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
            margin-top: 0px; /* magic! */
        }
        .icon {
            margin-bottom: $fileBorderWidth;
        }
    }
    .file-title {
        height: $fileTitleHeight;
        overflow: hidden;
        background-color: transparent;
        color: #000;
        padding: 0 6px;
        line-height: $fileTitleHeight;
        font-size: $fileTitleHeight/2;
        transition: color 0.4s;
    }
    .file-uploaded-at {
        display: none;
    }
}

.list-view {
    .file {
        flex-direction: row;
        border: $fileBorderWidth solid $fileBorderColor;
        transition: border-color 0.4s;
    }
    .selected {
        border-color: $fileBorderColorH;
    }
}

</style>
