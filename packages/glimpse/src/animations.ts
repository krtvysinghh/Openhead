import { SlideAnimation, SlideModel } from './types';

export class AnimationTimelineManager {
  /**
   * Adds an entrance or emphasis animation to a slide node.
   */
  public static addAnimation(
    slide: SlideModel,
    targetNodeId: string,
    type: SlideAnimation['type'] = 'fade',
    trigger: SlideAnimation['trigger'] = 'onClick',
    durationMs: number = 400,
    delayMs: number = 0
  ): SlideAnimation {
    if (!slide.animations) {
      slide.animations = [];
    }

    const anim: SlideAnimation = {
      id: `anim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      targetNodeId,
      type,
      trigger,
      durationMs,
      delayMs,
    };

    slide.animations.push(anim);
    return anim;
  }

  /**
   * Reorders animations on a slide.
   */
  public static moveAnimation(slide: SlideModel, fromIndex: number, toIndex: number): boolean {
    if (!slide.animations || fromIndex < 0 || fromIndex >= slide.animations.length || toIndex < 0 || toIndex >= slide.animations.length) {
      return false;
    }
    const [item] = slide.animations.splice(fromIndex, 1);
    slide.animations.splice(toIndex, 0, item);
    return true;
  }

  /**
   * Deletes an animation from a slide.
   */
  public static deleteAnimation(slide: SlideModel, animationId: string): boolean {
    if (!slide.animations) return false;
    const initialLen = slide.animations.length;
    slide.animations = slide.animations.filter((a) => a.id !== animationId);
    return slide.animations.length < initialLen;
  }
}
