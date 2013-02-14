#import "AbstractActionSheetPicker.h"

@class ActionSheetStringPicker;
typedef void(^ActionStringDoneBlock)(ActionSheetStringPicker *picker, NSInteger selectedIndex, id selectedValue);
typedef void(^ActionStringCancelBlock)(ActionSheetStringPicker *picker);

@interface ActionSheetStringPicker : AbstractActionSheetPicker <UIPickerViewDelegate, UIPickerViewDataSource>
/* Create and display an action sheet picker. The returned picker is autoreleased. 
 "origin" must not be empty.  It can be either an originating container view or a UIBarButtonItem to use with a popover arrow.
 "target" must not be empty.  It should respond to "onSuccess" actions.
 "rows" is an array of strings to use for the picker's available selection choices. 
 "initialSelection" is used to establish the initially selected row;
 */
+ (id)showPickerWithTitle:(NSString *)title rows:(NSArray *)data initialSelection:(NSInteger)index target:(id)target successAction:(SEL)successAction cancelAction:(SEL)cancelActionOrNil origin:(id)origin;

    // Create an action sheet picker, but don't display until a subsequent call to "showActionPicker".  Receiver must release the picker when ready. */
- (id)initWithTitle:(NSString *)title rows:(NSArray *)data initialSelection:(NSInteger)index target:(id)target successAction:(SEL)successAction cancelAction:(SEL)cancelActionOrNil origin:(id)origin;



+ (id)showPickerWithTitle:(NSString *)title rows:(NSArray *)strings initialSelection:(NSInteger)index doneBlock:(ActionStringDoneBlock)doneBlock cancelBlock:(ActionStringCancelBlock)cancelBlock origin:(id)origin;

- (id)initWithTitle:(NSString *)title rows:(NSArray *)strings initialSelection:(NSInteger)index doneBlock:(ActionStringDoneBlock)doneBlock cancelBlock:(ActionStringCancelBlock)cancelBlockOrNil origin:(id)origin;

@property (nonatomic, copy) ActionStringDoneBlock onActionSheetDone;
@property (nonatomic, copy) ActionStringCancelBlock onActionSheetCancel;

@end

